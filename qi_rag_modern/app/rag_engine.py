"""
Modern RAG Engine with Hybrid Search and Advanced 3D Visualization
Combines BM25 keyword search with ChromaDB vector search
Includes UMAP, t-SNE, and PCA dimensionality reduction
"""

from __future__ import annotations

import asyncio
import logging
from typing import AsyncGenerator, Dict, List, Optional, Any, Tuple

import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler

from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
from langchain.schema import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .config import Settings

logger = logging.getLogger(__name__)

class RAGEngine:
    """Modern RAG engine with hybrid search and advanced 3D visualization capabilities"""
    
    def __init__(self):
        self.settings = Settings()
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=self.settings.openai_api_key,
            model="text-embedding-3-small"
        )
        self.llm = ChatOpenAI(
            openai_api_key=self.settings.openai_api_key,
            model="gpt-3.5-turbo",
            temperature=0.1,
            streaming=True
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        
        # Initialize ChromaDB client
        self.chroma_client = None
        self._initialize_chroma()
        
        # Cache for retrievers and visualizations
        self._retriever_cache: Dict[str, Any] = {}
        self._viz_cache: Dict[str, Dict] = {}
        
        # Color palette for document types
        self.color_palette = {
            'pdf': '#FF6B6B',      # Red
            'docx': '#4ECDC4',     # Teal
            'txt': '#45B7D1',      # Blue
            'markdown': '#96CEB4',  # Green
            'html': '#FFA07A',     # Light Salmon
            'json': '#DDA0DD',     # Plum
            'csv': '#98FB98',      # Pale Green
            'general': '#FFEAA7'   # Yellow
        }
        
    def _initialize_chroma(self):
        """Initialize ChromaDB connection"""
        try:
            import chromadb
            self.chroma_client = chromadb.PersistentClient(
                path=self.settings.chroma_persist_directory
            )
            logger.info("ChromaDB initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            self.chroma_client = None
    
    def is_connected(self) -> bool:
        """Check if ChromaDB is connected"""
        return self.chroma_client is not None
    
    def _get_collection_name(self, client_id: str) -> str:
        """Get collection name for a client"""
        return f"client-{client_id}-documents"
    
    def _create_hybrid_retriever(self, client_id: str) -> EnsembleRetriever:
        """Create hybrid retriever combining BM25 and ChromaDB"""
        collection_name = self._get_collection_name(client_id)
        
        # Create ChromaDB vector store
        vectorstore = Chroma(
            client=self.chroma_client,
            collection_name=collection_name,
            embedding_function=self.embeddings,
        )
        
        # Get all documents from ChromaDB for BM25
        try:
            all_docs = vectorstore.get()
            documents = []
            
            if all_docs and 'documents' in all_docs:
                for i, doc_text in enumerate(all_docs['documents']):
                    metadata = all_docs['metadatas'][i] if 'metadatas' in all_docs else {}
                    documents.append(Document(
                        page_content=doc_text,
                        metadata=metadata
                    ))
            
            # Create BM25 retriever
            bm25_retriever = BM25Retriever.from_documents(documents)
            bm25_retriever.k = 10  # Number of documents to retrieve
            
            # Create ChromaDB retriever
            chroma_retriever = vectorstore.as_retriever(
                search_kwargs={"k": 10}
            )
            
            # Combine retrievers with weights
            ensemble_retriever = EnsembleRetriever(
                retrievers=[bm25_retriever, chroma_retriever],
                weights=[0.3, 0.7]  # Favor vector search slightly
            )
            
            return ensemble_retriever
            
        except Exception as e:
            logger.error(f"Failed to create hybrid retriever: {e}")
            # Fallback to ChromaDB only
            return vectorstore.as_retriever(search_kwargs={"k": 10})
    
    def _get_retriever(self, client_id: str) -> Any:
        """Get or create retriever for a client"""
        if client_id not in self._retriever_cache:
            self._retriever_cache[client_id] = self._create_hybrid_retriever(client_id)
        return self._retriever_cache[client_id]
    
    def _create_rag_chain(self, client_id: str):
        """Create RAG chain for a client"""
        retriever = self._get_retriever(client_id)
        
        # Create prompt template
        prompt = ChatPromptTemplate.from_template("""
You are a helpful AI assistant with access to the following context documents.

<context>
{context}
</context>

Answer the question based only on the provided context. If the context doesn't contain enough information to answer the question, say "I don't have enough information to answer that question."

Question: {input}
Answer:""")
        
        # Create document chain
        document_chain = create_stuff_documents_chain(
            llm=self.llm,
            prompt=prompt
        )
        
        # Create retrieval chain
        retrieval_chain = create_retrieval_chain(
            retriever=retriever,
            combine_docs_chain=document_chain
        )
        
        return retrieval_chain
    
    def _perform_dimensionality_reduction(
        self, 
        embeddings: np.ndarray, 
        method: str = "umap",
        **kwargs
    ) -> np.ndarray:
        """Perform dimensionality reduction using various algorithms"""
        # Standardize embeddings for better results
        scaler = StandardScaler()
        embeddings_scaled = scaler.fit_transform(embeddings)
        
        if method.lower() == "umap":
            try:
                import umap
                reducer = umap.UMAP(
                    n_components=3,
                    random_state=42,
                    n_neighbors=min(15, len(embeddings) - 1),
                    min_dist=0.1,
                    metric='cosine',
                    **kwargs
                )
            except ImportError:
                logger.warning("UMAP not available, falling back to t-SNE")
                method = "tsne"
        
        if method.lower() == "tsne":
            reducer = TSNE(
                n_components=3,
                random_state=42,
                perplexity=min(30, len(embeddings) - 1),
                metric='cosine',
                **kwargs
            )
        elif method.lower() == "pca":
            reducer = PCA(n_components=3, random_state=42)
        else:
            raise ValueError(f"Unsupported dimensionality reduction method: {method}")
        
        coords_3d = reducer.fit_transform(embeddings_scaled)
        return coords_3d
    
    def _get_visual_encoding(self, metadata: Dict, content: str) -> Dict[str, Any]:
        """Get comprehensive visual encoding for a document"""
        doc_type = metadata.get('document_type', 'general')
        file_size = metadata.get('file_size', 0)
        created_date = metadata.get('created_date')
        
        # Color coding
        color = self.color_palette.get(doc_type, self.color_palette['general'])
        
        # Size encoding based on content length or importance
        content_length = len(content)
        if content_length > 5000:
            size = 0.8  # Large documents
        elif content_length > 2000:
            size = 0.6  # Medium documents
        else:
            size = 0.4  # Small documents
        
        # Shape encoding based on document type
        shape_map = {
            'pdf': 'sphere',
            'docx': 'cube',
            'txt': 'cylinder',
            'markdown': 'octahedron',
            'html': 'torus',
            'json': 'dodecahedron',
            'csv': 'icosahedron',
            'general': 'sphere'
        }
        shape = shape_map.get(doc_type, 'sphere')
        
        # Opacity based on recency (if date available)
        opacity = 1.0
        if created_date:
            # Simple opacity based on whether it's recent
            opacity = 0.8  # Could be enhanced with actual date logic
        
        return {
            "color": color,
            "size": size,
            "shape": shape,
            "opacity": opacity,
            "content_length": content_length,
            "doc_type": doc_type
        }
    
    async def get_3d_visualization_data(
        self, 
        client_id: str, 
        method: str = "umap",
        use_cache: bool = True,
        **kwargs
    ) -> Dict[str, Any]:
        """Get advanced 3D visualization data for documents"""
        try:
            # Check cache first
            cache_key = f"{client_id}_{method}"
            if use_cache and cache_key in self._viz_cache:
                return self._viz_cache[cache_key]
            
            collection_name = self._get_collection_name(client_id)
            collection = self.chroma_client.get_collection(collection_name)
            
            # Get all embeddings and metadata
            results = collection.get(
                include=['embeddings', 'metadatas', 'documents', 'ids']
            )
            
            if not results['embeddings']:
                return {
                    "points": [], 
                    "metadata": [],
                    "method": method,
                    "total_documents": 0,
                    "clusters": [],
                    "statistics": {}
                }
            
            embeddings = np.array(results['embeddings'])
            
            # Perform dimensionality reduction
            coords_3d = self._perform_dimensionality_reduction(
                embeddings, method, **kwargs
            )
            
            # Prepare visualization data with enhanced encodings
            points = []
            metadata = []
            cluster_data = {}
            
            for i, coord in enumerate(coords_3d):
                doc_content = results['documents'][i]
                doc_metadata = results['metadatas'][i] if results['metadatas'] else {}
                doc_id = results['ids'][i] if 'ids' in results else str(i)
                
                # Get visual encoding
                visual_encoding = self._get_visual_encoding(doc_metadata, doc_content)
                
                # Create point data
                point = {
                    "id": doc_id,
                    "x": float(coord[0]),
                    "y": float(coord[1]),
                    "z": float(coord[2]),
                    "color": visual_encoding["color"],
                    "size": visual_encoding["size"],
                    "shape": visual_encoding["shape"],
                    "opacity": visual_encoding["opacity"],
                    "is_relevant": False,
                    "relevance_score": 0.0
                }
                points.append(point)
                
                # Create metadata
                meta = {
                    "id": doc_id,
                    "content": doc_content[:150] + "..." if len(doc_content) > 150 else doc_content,
                    "content_preview": doc_content[:50] + "...",
                    "metadata": doc_metadata,
                    "visual_encoding": visual_encoding,
                    "cluster": self._determine_cluster(coord, method),
                    "neighbors": []  # Will be populated for AR interactions
                }
                metadata.append(meta)
                
                # Track clusters
                cluster = meta["cluster"]
                if cluster not in cluster_data:
                    cluster_data[cluster] = {
                        "count": 0,
                        "doc_types": set(),
                        "center": [0, 0, 0],
                        "documents": []
                    }
                cluster_data[cluster]["count"] += 1
                cluster_data[cluster]["doc_types"].add(visual_encoding["doc_type"])
                cluster_data[cluster]["center"][0] += coord[0]
                cluster_data[cluster]["center"][1] += coord[1]
                cluster_data[cluster]["center"][2] += coord[2]
                cluster_data[cluster]["documents"].append(doc_id)
            
            # Calculate cluster centers
            clusters = []
            for cluster_id, cluster_info in cluster_data.items():
                count = cluster_info["count"]
                center = [
                    cluster_info["center"][0] / count,
                    cluster_info["center"][1] / count,
                    cluster_info["center"][2] / count
                ]
                clusters.append({
                    "id": cluster_id,
                    "center": center,
                    "count": count,
                    "doc_types": list(cluster_info["doc_types"]),
                    "documents": cluster_info["documents"]
                })
            
            # Calculate statistics
            statistics = {
                "total_documents": len(points),
                "document_types": {},
                "content_length_stats": {
                    "min": min([m["visual_encoding"]["content_length"] for m in metadata]),
                    "max": max([m["visual_encoding"]["content_length"] for m in metadata]),
                    "avg": sum([m["visual_encoding"]["content_length"] for m in metadata]) / len(metadata)
                },
                "clusters_count": len(clusters),
                "method": method
            }
            
            # Count document types
            for meta in metadata:
                doc_type = meta["visual_encoding"]["doc_type"]
                statistics["document_types"][doc_type] = statistics["document_types"].get(doc_type, 0) + 1
            
            result = {
                "points": points,
                "metadata": metadata,
                "clusters": clusters,
                "statistics": statistics,
                "method": method,
                "total_documents": len(points),
                "color_palette": self.color_palette,
                "shape_mapping": {
                    'pdf': 'sphere',
                    'docx': 'cube',
                    'txt': 'cylinder',
                    'markdown': 'octahedron',
                    'html': 'torus',
                    'json': 'dodecahedron',
                    'csv': 'icosahedron',
                    'general': 'sphere'
                }
            }
            
            # Cache the result
            if use_cache:
                self._viz_cache[cache_key] = result
            
            return result
            
        except Exception as e:
            logger.error(f"3D visualization error: {e}")
            raise
    
    def _determine_cluster(self, coord: np.ndarray, method: str) -> str:
        """Determine cluster for a point based on position"""
        # Simple clustering based on position
        # In a real implementation, you might use K-means or DBSCAN
        x, y, z = coord
        
        if abs(x) < 0.5 and abs(y) < 0.5 and abs(z) < 0.5:
            return "center"
        elif x > 0.5:
            return "right"
        elif x < -0.5:
            return "left"
        elif y > 0.5:
            return "front"
        elif y < -0.5:
            return "back"
        elif z > 0.5:
            return "top"
        elif z < -0.5:
            return "bottom"
        else:
            return "center"
    
    async def get_query_visualization(
        self, 
        query: str, 
        client_id: str,
        method: str = "umap"
    ) -> Dict[str, Any]:
        """Get visualization data highlighting relevant documents for a query"""
        try:
            # Get all visualization data
            viz_data = await self.get_3d_visualization_data(client_id, method)
            
            # Get relevant documents for the query
            retriever = self._get_retriever(client_id)
            relevant_docs = await retriever.aget_relevant_documents(query)
            
            # Mark relevant documents and calculate relevance scores
            relevant_ids = set()
            relevance_scores = {}
            
            for doc in relevant_docs:
                # Find the document ID in our visualization data
                for i, meta in enumerate(viz_data['metadata']):
                    if meta['content'].startswith(doc.page_content[:50]):
                        relevant_ids.add(meta['id'])
                        # Simple relevance scoring based on position in results
                        relevance_scores[meta['id']] = 1.0 - (len(relevance_scores) * 0.1)
                        break
            
            # Update visualization data with relevance information
            for i, point in enumerate(viz_data['points']):
                point['is_relevant'] = point['id'] in relevant_ids
                point['relevance_score'] = relevance_scores.get(point['id'], 0.0)
                
                # Enhance visual encoding for relevant documents
                if point['is_relevant']:
                    point['size'] *= 1.5  # Make relevant documents larger
                    point['opacity'] = 1.0  # Full opacity for relevant docs
                    point['color'] = '#FFD700'  # Gold color for relevant docs
            
            # Add query-specific information
            viz_data.update({
                "query": query,
                "relevant_count": len(relevant_ids),
                "relevance_scores": relevance_scores,
                "query_embedding": None  # Could be added for AR positioning
            })
            
            return viz_data
            
        except Exception as e:
            logger.error(f"Query visualization error: {e}")
            raise
    
    async def get_ar_visualization_data(
        self, 
        client_id: str,
        anchor_position: Optional[Dict[str, float]] = None,
        method: str = "umap"
    ) -> Dict[str, Any]:
        """Get AR-optimized visualization data"""
        try:
            # Get base visualization data
            viz_data = await self.get_3d_visualization_data(client_id, method)
            
            # Optimize for AR display
            ar_data = {
                **viz_data,
                "ar_optimized": True,
                "anchor_position": anchor_position or {"x": 0, "y": 0, "z": 0},
                "scale_factor": 0.1,  # Scale down for AR display
                "max_points_display": 100,  # Limit points for performance
                "interaction_zones": [],
                "gesture_controls": {
                    "pinch_zoom": True,
                    "two_finger_rotate": True,
                    "one_finger_drag": True,
                    "voice_commands": True
                }
            }
            
            # Limit points for AR performance
            if len(ar_data['points']) > ar_data['max_points_display']:
                # Sample points intelligently
                indices = np.linspace(0, len(ar_data['points'])-1, ar_data['max_points_display'], dtype=int)
                ar_data['points'] = [ar_data['points'][i] for i in indices]
                ar_data['metadata'] = [ar_data['metadata'][i] for i in indices]
            
            # Scale coordinates for AR
            for point in ar_data['points']:
                point['x'] *= ar_data['scale_factor']
                point['y'] *= ar_data['scale_factor']
                point['z'] *= ar_data['scale_factor']
                point['size'] *= ar_data['scale_factor']
            
            # Add interaction zones for AR
            for cluster in ar_data['clusters']:
                center = cluster['center']
                ar_data['interaction_zones'].append({
                    "id": f"zone_{cluster['id']}",
                    "center": [
                        center[0] * ar_data['scale_factor'],
                        center[1] * ar_data['scale_factor'],
                        center[2] * ar_data['scale_factor']
                    ],
                    "radius": 0.5 * ar_data['scale_factor'],
                    "cluster_id": cluster['id'],
                    "documents": cluster['documents']
                })
            
            return ar_data
            
        except Exception as e:
            logger.error(f"AR visualization error: {e}")
            raise
    
    async def chat(
        self, 
        message: str, 
        client_id: str, 
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """Chat with RAG system"""
        try:
            chain = self._create_rag_chain(client_id)
            
            # Get response
            response = await chain.ainvoke({
                "input": message
            })
            
            # Get sources from retriever
            retriever = self._get_retriever(client_id)
            docs = await retriever.aget_relevant_documents(message)
            
            sources = []
            for doc in docs[:5]:  # Top 5 sources
                sources.append({
                    "content": doc.page_content[:200] + "...",
                    "metadata": doc.metadata
                })
            
            return {
                "answer": response["answer"],
                "sources": sources,
                "metadata": {
                    "client_id": client_id,
                    "model": "gpt-3.5-turbo",
                    "max_tokens": max_tokens
                }
            }
            
        except Exception as e:
            logger.error(f"Chat error: {e}")
            raise
    
    async def stream_chat(
        self, 
        message: str, 
        client_id: str, 
        max_tokens: int = 1000
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream chat response"""
        try:
            chain = self._create_rag_chain(client_id)
            
            # Stream response
            async for chunk in chain.astream({
                "input": message
            }):
                if "answer" in chunk:
                    yield {
                        "type": "content",
                        "content": chunk["answer"]
                    }
                elif "context" in chunk:
                    # Send sources info
                    docs = chunk["context"]
                    sources = []
                    for doc in docs[:3]:  # Top 3 sources
                        sources.append({
                            "content": doc.page_content[:150] + "...",
                            "metadata": doc.metadata
                        })
                    yield {
                        "type": "sources",
                        "sources": sources
                    }
            
            yield {"type": "done"}
            
        except Exception as e:
            logger.error(f"Stream chat error: {e}")
            yield {"type": "error", "error": str(e)}
    
    async def add_documents(
        self, 
        documents: List[Document], 
        client_id: str
    ) -> int:
        """Add documents to the RAG system"""
        try:
            collection_name = self._get_collection_name(client_id)
            
            # Split documents
            split_docs = self.text_splitter.split_documents(documents)
            
            # Add to ChromaDB
            vectorstore = Chroma(
                client=self.chroma_client,
                collection_name=collection_name,
                embedding_function=self.embeddings,
            )
            
            # Add documents
            vectorstore.add_documents(split_docs)
            
            # Clear caches for this client
            if client_id in self._retriever_cache:
                del self._retriever_cache[client_id]
            
            # Clear visualization cache
            cache_keys_to_remove = [k for k in self._viz_cache.keys() if k.startswith(f"{client_id}_")]
            for key in cache_keys_to_remove:
                del self._viz_cache[key]
            
            logger.info(f"Added {len(split_docs)} chunks for client {client_id}")
            return len(split_docs)
            
        except Exception as e:
            logger.error(f"Add documents error: {e}")
            raise
    
    async def delete_documents(self, client_id: str) -> bool:
        """Delete all documents for a client"""
        try:
            collection_name = self._get_collection_name(client_id)
            
            # Delete collection
            self.chroma_client.delete_collection(collection_name)
            
            # Clear caches
            if client_id in self._retriever_cache:
                del self._retriever_cache[client_id]
            
            # Clear visualization cache
            cache_keys_to_remove = [k for k in self._viz_cache.keys() if k.startswith(f"{client_id}_")]
            for key in cache_keys_to_remove:
                del self._viz_cache[key]
            
            logger.info(f"Deleted documents for client {client_id}")
            return True
            
        except Exception as e:
            logger.error(f"Delete documents error: {e}")
            raise
    
    async def get_document_count(self, client_id: str) -> int:
        """Get number of documents for a client"""
        try:
            collection_name = self._get_collection_name(client_id)
            collection = self.chroma_client.get_collection(collection_name)
            return collection.count()
        except Exception as e:
            logger.error(f"Get document count error: {e}")
            return 0
    
    def clear_cache(self, client_id: Optional[str] = None):
        """Clear visualization cache"""
        if client_id:
            cache_keys_to_remove = [k for k in self._viz_cache.keys() if k.startswith(f"{client_id}_")]
            for key in cache_keys_to_remove:
                del self._viz_cache[key]
        else:
            self._viz_cache.clear()
