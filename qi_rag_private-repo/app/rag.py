"""Core retrieval and ingestion logic.

This module provides helper functions to create a Qdrant client, split
documents into chunks, generate embeddings and perform similarity search.
"""

from __future__ import annotations

import logging
import os
import uuid
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from sentence_transformers import SentenceTransformer

from .utils import (
    determine_tier_for_file,
    load_env_mapping,
    parse_front_matter,
    read_pdf,
    read_text_file,
)

logger = logging.getLogger(__name__)


class RagEngine:
    """Encapsulates embedding, storage and retrieval operations."""

    def __init__(self) -> None:
        # Load environment variables
        self.data_root = Path(os.getenv("DATA_ROOT", "."))
        self.qdrant_host = os.getenv("QDRANT_HOST", "localhost")
        self.qdrant_port = int(os.getenv("QDRANT_PORT", "6333"))
        self.embedding_model_name = os.getenv("EMBEDDING_MODEL", "bge-small-en-v1.5")
        self.chunk_size = int(os.getenv("CHUNK_SIZE", "800"))
        self.chunk_overlap = int(os.getenv("CHUNK_OVERLAP", "100"))
        self.top_k = int(os.getenv("TOP_K", "5"))

        # Load mapping from env
        self.tier_collections = load_env_mapping("TIER_COLLECTIONS")
        self.folder_tiers = load_env_mapping("FOLDER_TIERS")

        # Initialise components
        self._client = QdrantClient(host=self.qdrant_host, port=self.qdrant_port)
        self._embedder: Optional[SentenceTransformer] = None

    def embedder(self) -> SentenceTransformer:
        """Lazy load the embedding model."""
        if self._embedder is None:
            self._embedder = SentenceTransformer(self.embedding_model_name)
        return self._embedder

    # Document handling
    def load_document(self, path: Path) -> Tuple[str, Dict[str, str]]:
        """Load the contents of a document and return (text, metadata)."""
        if path.suffix.lower() == ".pdf":
            text = read_pdf(path)
        else:
            text = read_text_file(path)
        # Extract front‑matter if present
        meta, body = parse_front_matter(text) if path.suffix.lower() in {".md", ".markdown"} else ({}, text)
        return body, meta or {}

    def split_text(self, text: str) -> List[str]:
        """Split a document into overlapping chunks.

        We perform a naive word‑based segmentation using whitespace to approximate
        tokens.  Each chunk contains at most `chunk_size` words with
        `chunk_overlap` words overlap with the previous chunk.  You may
        substitute a more sophisticated tokeniser here.
        """
        words = text.split()
        if not words:
            return []
        chunks: List[str] = []
        step = self.chunk_size - self.chunk_overlap
        for i in range(0, len(words), step):
            chunk_words = words[i : i + self.chunk_size]
            chunk = " ".join(chunk_words)
            chunks.append(chunk)
            if i + self.chunk_size >= len(words):
                break
        return chunks

    def ensure_collection(self, collection_name: str, vector_size: int) -> None:
        """Create a collection if it does not already exist."""
        try:
            self._client.get_collection(collection_name)
        except Exception:
            # Use default configuration: HNSW + cosine distance
            self._client.create_collection(
                collection_name=collection_name,
                vectors_config=qmodels.VectorParams(size=vector_size, distance=qmodels.Distance.COSINE),
            )

    def upsert_document(self, path: Path) -> None:
        """Ingest a single file into the appropriate tier collection."""
        try:
            logger.info(f"Starting ingestion of document: {path}")
            body, meta = self.load_document(path)
            tier = determine_tier_for_file(path, self.folder_tiers)
            collection = self.tier_collections.get(tier, f"q_{tier.lower()}")

            # Split into chunks and embed
            chunks = self.split_text(body)
            if not chunks:
                logger.warning(f"No chunks generated for document: {path}")
                return
            
            logger.info(f"Generated {len(chunks)} chunks for document: {path}")
            embeddings = self.embedder().encode(chunks).tolist()
            
            # Ensure collection exists
            self.ensure_collection(collection, len(embeddings[0]))
            
            points: List[qmodels.PointStruct] = []
            for idx, vector in enumerate(embeddings):
                payload = {
                    "path": str(path),
                    "tier": tier,
                    "metadata": meta,
                    "chunk_index": idx,
                }
                points.append(
                    qmodels.PointStruct(
                        id=str(uuid.uuid4()),
                        vector=vector,
                        payload=payload,
                    )
                )
            
            # Upsert points
            self._client.upsert(collection_name=collection, points=points)
            logger.info(f"Successfully ingested document: {path} into collection: {collection}")
            
        except Exception as e:
            logger.error(f"Failed to ingest document {path}: {str(e)}")
            raise

    def query(self, question: str, tiers: List[str]) -> List[Tuple[str, float, Dict[str, str]]]:
        """Search for relevant chunks across multiple tiers.

        Returns a list of tuples `(text, score, payload)`.  The text is the chunk
        content, score is the similarity score (the higher the better), and
        payload contains metadata such as the original file path and tier.
        """
        # Embed the question
        q_emb = self.embedder().encode([question]).tolist()[0]
        results: List[Tuple[str, float, Dict[str, str]]] = []
        for tier in tiers:
            collection = self.tier_collections.get(tier, f"q_{tier.lower()}")
            try:
                search_res = self._client.search(collection, q_emb, limit=self.top_k)
            except Exception:
                continue
            for res in search_res:
                payload = res.payload or {}
                # We need to fetch the actual chunk text.  Qdrant stores only the
                # embedding and payload; to reconstruct the text we must read
                # the document and split again.  For MVP we include the chunk
                # index in the payload and re‑compute the split.
                path = Path(payload.get("path", ""))
                idx = payload.get("chunk_index", 0)
                try:
                    text, _ = self.load_document(path)
                    chunk = self.split_text(text)[idx]
                except Exception:
                    chunk = ""
                results.append((chunk, res.score, payload))
        # Sort results by descending score
        results.sort(key=lambda x: x[1], reverse=True)
        return results