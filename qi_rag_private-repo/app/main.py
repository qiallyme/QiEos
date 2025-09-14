"""FastAPI application for the tiered RAG backend."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import List, Optional

import requests
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from .llm import generate_answer
from .rag import RagEngine
from .utils import load_tier_policies

# Instantiate the engine once at startup
engine = RagEngine()
app = FastAPI(title="Tiered RAG API", version="0.1.0")

# Load tier policies and cloud endpoint from environment
tier_policies = load_tier_policies()
cloud_endpoint = os.getenv("CLOUD_ENDPOINT", "").strip() or None


class IngestRequest(BaseModel):
    path: str


@app.post("/ingest")
def ingest(req: IngestRequest) -> dict:
    """Ingest a single file specified by its path relative to DATA_ROOT."""
    # Validate path to prevent path traversal attacks
    if ".." in req.path or req.path.startswith("/") or req.path.startswith("\\"):
        raise HTTPException(status_code=400, detail="Invalid path: path traversal not allowed")
    
    # Resolve path relative to data root
    full_path = Path(engine.data_root) / req.path
    try:
        # Ensure the resolved path is within the data root directory
        full_path = full_path.resolve()
        if not str(full_path).startswith(str(engine.data_root.resolve())):
            raise HTTPException(status_code=400, detail="Invalid path: outside data root")
    except (ValueError, RuntimeError):
        raise HTTPException(status_code=400, detail="Invalid path")
    
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(status_code=404, detail=f"File not found: {full_path}")
    try:
        engine.upsert_document(full_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"status": "ok", "path": str(full_path)}


class ChatResponse(BaseModel):
    answer: str
    sources: List[dict]
    fallback_used: bool


@app.post("/chat", response_model=ChatResponse)
def chat(question: str = Query(...), tiers: Optional[str] = Query(None)) -> ChatResponse:
    """Answer a question using content from the specified classification tiers."""
    # Validate input
    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    if len(question) > 10000:  # Reasonable limit for question length
        raise HTTPException(status_code=400, detail="Question too long (max 10000 characters)")
    
    # Determine which tiers to search
    if tiers:
        requested_tiers = [t.strip().upper() for t in tiers.split(",") if t.strip()]
    else:
        # Default to UNCLASS and CLASSIFIED
        requested_tiers = ["UNCLASS", "CLASSIFIED"]

    # Query local collections
    results = engine.query(question, requested_tiers)
    # Determine which tiers returned nothing and allow fallback
    missing_tiers = set(requested_tiers) - {res[2].get("tier") for res in results}
    fallback_used = False
    remote_answer: Optional[str] = None

    if missing_tiers and cloud_endpoint:
        # Check policy: we only fall back for tiers whose policy is true
        allowed_tiers = [t for t in missing_tiers if tier_policies.get(t, False)]
        if allowed_tiers:
            # Proxy the query to the remote endpoint
            try:
                timeout = int(os.getenv("CLOUD_REQUEST_TIMEOUT", "30"))
                resp = requests.post(
                    cloud_endpoint.rstrip("/") + "/chat",
                    params={"question": question, "tiers": ",".join(allowed_tiers)},
                    timeout=timeout,
                )
                resp.raise_for_status()
                data = resp.json()
                remote_answer = data.get("answer") or None
                fallback_used = True
            except Exception:
                remote_answer = None

    # Compose context texts for the local answer
    contexts = [res[0] for res in results]
    if contexts:
        answer = generate_answer(question, contexts)
    elif remote_answer:
        answer = remote_answer
    else:
        answer = "No relevant information available."

    # Prepare sources list
    sources = [
        {
            "text": res[0],
            "score": res[1],
            "tier": res[2].get("tier"),
            "path": res[2].get("path"),
        }
        for res in results
    ]

    return ChatResponse(answer=answer, sources=sources, fallback_used=fallback_used)


@app.get("/")
def root() -> dict:
    return {"message": "Tiered RAG API is running."}