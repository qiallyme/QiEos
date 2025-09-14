"""
Multi-Vector Retriever for Multimodal RAG
Handles text summaries, images, videos, and other multimodal content
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Dict, List, Optional, Any, Union
from pathlib import Path

from langchain.retrievers.multi_vector import MultiVectorRetriever
from langchain.storage import InMemoryStore
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

from .config import Settings

logger = logging.getLogger(__name__)

class MultimodalRetriever:
    """Multi-vector retriever for handling multimodal content"""
    
    def __init__(self, client_id: str):
        self.settings = Settings()
        self.client_id = client_id
        
        # Initialize embedding model
        self.embedding_model = OpenAIEmbeddings(
            openai_api_key=self.settings.openai_api_key,
            model="text-embedding-3-small"
        )
        
        # Initialize multimodal LLM
        self.multimodal_llm = None
        self._initialize_multimodal_llm()
        
        # Initialize vector store and document store
        self.vectorstore = Chroma(
            collection_name=f"client-{client_id}-multimodal",
            embedding_function=self.embedding_model,
        )
        
        self.docstore = InMemoryStore()
        
        # Create multi-vector retriever
        self.retriever = MultiVectorRetriever(
            vectorstore=self.vectorstore,
            docstore=self.docstore,
            id_key="doc_id",
        )
        
        # Initialize multimodal LLM for final response generation
        self._initialize_multimodal_llm()
    
    def _initialize_multimodal_llm(self):
        """Initialize multimodal LLM for final response generation"""
        try:
            # Try to initialize Google Gemini for multimodal responses
            import google.generativeai as genai
            genai.configure(api_key=self.settings.gemini_api_key)
            self.multimodal_llm = genai.GenerativeModel('gemini-pro-vision')
            logger.info("Multimodal LLM (Gemini) initialized successfully")
        except ImportError:
            logger.warning("Google Gemini not available for multimodal LLM")
        except Exception as e:
            logger.error(f"Failed to initialize multimodal LLM: {e}")
    
    async def add_text_document(
        self, 
        content: str, 
        metadata: Optional[Dict] = None
    ) -> str:
        """Add a text document to the multi-vector retriever"""
        try:
            doc_id = str(uuid.uuid4())
            
            # Create text document
            text_doc = Document(
                page_content=content,
                metadata={
                    "doc_id": doc_id,
                    "type": "text",
                    "client_id": self.client_id,
                    **(metadata or {})
                }
            )
            
            # Add to vector store
            self.retriever.vectorstore.add_documents([text_doc])
            
            # Store reference in document store
            self.retriever.docstore.mset([(doc_id, text_doc)])
            
            logger.info(f"Added text document with ID: {doc_id}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Error adding text document: {e}")
            raise
    
    async def add_image_document(
        self, 
        image_path: str, 
        image_summary: str,
        metadata: Optional[Dict] = None
    ) -> str:
        """Add an image document with its text summary"""
        try:
            doc_id = str(uuid.uuid4())
            
            # Create image document (stores the image path)
            image_doc = Document(
                page_content=image_path,
                metadata={
                    "doc_id": doc_id,
                    "type": "image",
                    "client_id": self.client_id,
                    "image_summary": image_summary,
                    **(metadata or {})
                }
            )
            
            # Create text summary document for embedding
            summary_doc = Document(
                page_content=image_summary,
                metadata={
                    "doc_id": doc_id,
                    "type": "image_summary",
                    "client_id": self.client_id,
                    "original_image_path": image_path,
                    **(metadata or {})
                }
            )
            
            # Add summary to vector store for retrieval
            self.retriever.vectorstore.add_documents([summary_doc])
            
            # Store image reference in document store
            self.retriever.docstore.mset([(doc_id, image_doc)])
            
            logger.info(f"Added image document with ID: {doc_id}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Error adding image document: {e}")
            raise
    
    async def add_video_document(
        self, 
        video_path: str, 
        video_summary: str,
        keyframe_summaries: Optional[List[str]] = None,
        audio_transcript: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> str:
        """Add a video document with its summaries"""
        try:
            doc_id = str(uuid.uuid4())
            
            # Create video document
            video_doc = Document(
                page_content=video_path,
                metadata={
                    "doc_id": doc_id,
                    "type": "video",
                    "client_id": self.client_id,
                    "video_summary": video_summary,
                    "keyframe_summaries": keyframe_summaries or [],
                    "audio_transcript": audio_transcript,
                    **(metadata or {})
                }
            )
            
            # Create comprehensive text summary for embedding
            full_summary = f"Video Summary: {video_summary}"
            if keyframe_summaries:
                full_summary += f"\n\nKeyframe Descriptions:\n" + "\n".join(
                    f"- Frame {i+1}: {summary}" 
                    for i, summary in enumerate(keyframe_summaries)
                )
            if audio_transcript:
                full_summary += f"\n\nAudio Transcript: {audio_transcript}"
            
            summary_doc = Document(
                page_content=full_summary,
                metadata={
                    "doc_id": doc_id,
                    "type": "video_summary",
                    "client_id": self.client_id,
                    "original_video_path": video_path,
                    **(metadata or {})
                }
            )
            
            # Add summary to vector store
            self.retriever.vectorstore.add_documents([summary_doc])
            
            # Store video reference in document store
            self.retriever.docstore.mset([(doc_id, video_doc)])
            
            logger.info(f"Added video document with ID: {doc_id}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Error adding video document: {e}")
            raise
    
    async def add_audio_document(
        self, 
        audio_path: str, 
        audio_transcript: str,
        metadata: Optional[Dict] = None
    ) -> str:
        """Add an audio document with its transcript"""
        try:
            doc_id = str(uuid.uuid4())
            
            # Create audio document
            audio_doc = Document(
                page_content=audio_path,
                metadata={
                    "doc_id": doc_id,
                    "type": "audio",
                    "client_id": self.client_id,
                    "audio_transcript": audio_transcript,
                    **(metadata or {})
                }
            )
            
            # Create transcript document for embedding
            transcript_doc = Document(
                page_content=audio_transcript,
                metadata={
                    "doc_id": doc_id,
                    "type": "audio_transcript",
                    "client_id": self.client_id,
                    "original_audio_path": audio_path,
                    **(metadata or {})
                }
            )
            
            # Add transcript to vector store
            self.retriever.vectorstore.add_documents([transcript_doc])
            
            # Store audio reference in document store
            self.retriever.docstore.mset([(doc_id, audio_doc)])
            
            logger.info(f"Added audio document with ID: {doc_id}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Error adding audio document: {e}")
            raise
    
    async def retrieve_relevant_documents(
        self, 
        query: str, 
        k: int = 5
    ) -> List[Document]:
        """Retrieve relevant documents for a query"""
        try:
            # Use the multi-vector retriever to get relevant documents
            docs = await self.retriever.aget_relevant_documents(query, k=k)
            return docs
        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            raise
    
    async def generate_multimodal_response(
        self, 
        query: str, 
        retrieved_docs: List[Document]
    ) -> str:
        """Generate a multimodal response using the retrieved documents"""
        try:
            if not self.multimodal_llm:
                # Fallback to text-only response
                return await self._generate_text_response(query, retrieved_docs)
            
            # Prepare multimodal content
            text_content = []
            image_paths = []
            video_paths = []
            audio_paths = []
            
            for doc in retrieved_docs:
                doc_type = doc.metadata.get("type", "text")
                
                if doc_type == "text":
                    text_content.append(doc.page_content)
                elif doc_type == "image":
                    image_paths.append(doc.page_content)
                    if "image_summary" in doc.metadata:
                        text_content.append(f"Image: {doc.metadata['image_summary']}")
                elif doc_type == "video":
                    video_paths.append(doc.page_content)
                    if "video_summary" in doc.metadata:
                        text_content.append(f"Video: {doc.metadata['video_summary']}")
                elif doc_type == "audio":
                    audio_paths.append(doc.page_content)
                    if "audio_transcript" in doc.metadata:
                        text_content.append(f"Audio: {doc.metadata['audio_transcript']}")
            
            # Combine text content
            combined_text = "\n\n".join(text_content)
            
            # Create multimodal prompt
            prompt = f"""You are a helpful AI assistant with access to multimodal content.

Context from retrieved documents:
{combined_text}

User Question: {query}

Please provide a comprehensive answer based on the available text, image, video, and audio content. If the content includes images, videos, or audio files, reference them appropriately in your response."""

            # Generate response
            if image_paths and self.multimodal_llm:
                # Load and include images in the response
                from PIL import Image
                images = []
                for img_path in image_paths[:3]:  # Limit to 3 images for performance
                    try:
                        img = Image.open(img_path)
                        images.append(img)
                    except Exception as e:
                        logger.warning(f"Could not load image {img_path}: {e}")
                
                if images:
                    response = self.multimodal_llm.generate_content([prompt, *images])
                    return response.text
            
            # Text-only response
            response = self.multimodal_llm.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating multimodal response: {e}")
            # Fallback to text response
            return await self._generate_text_response(query, retrieved_docs)
    
    async def _generate_text_response(
        self, 
        query: str, 
        retrieved_docs: List[Document]
    ) -> str:
        """Generate a text-only response as fallback"""
        try:
            # Combine document content
            context = "\n\n".join([doc.page_content for doc in retrieved_docs])
            
            # Simple prompt for text response
            prompt = f"""Based on the following context, answer the user's question:

Context:
{context}

Question: {query}

Answer:"""
            
            # For now, return a simple response
            # In a full implementation, you'd use a text LLM here
            return f"Based on the retrieved documents, here's what I found:\n\n{context[:500]}..."
            
        except Exception as e:
            logger.error(f"Error generating text response: {e}")
            return "I'm sorry, I couldn't generate a response at this time."
    
    async def create_multimodal_rag_chain(self):
        """Create a multimodal RAG chain"""
        try:
            # Create prompt template
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a helpful AI assistant with access to multimodal content. Use the provided context to answer the user's question."),
                ("human", "{input}"),
            ])
            
            # Create document combining chain
            document_chain = create_stuff_documents_chain(
                llm=None,  # We'll handle LLM separately for multimodal
                prompt=prompt
            )
            
            # Create retrieval chain
            retrieval_chain = create_retrieval_chain(
                retriever=self.retriever,
                combine_docs_chain=document_chain
            )
            
            return retrieval_chain
            
        except Exception as e:
            logger.error(f"Error creating multimodal RAG chain: {e}")
            raise
    
    async def delete_document(self, doc_id: str) -> bool:
        """Delete a document from the multi-vector retriever"""
        try:
            # Remove from document store
            self.retriever.docstore.mdelete([doc_id])
            
            # Note: ChromaDB doesn't have a direct delete by metadata method
            # In a production system, you'd need to implement proper deletion
            logger.info(f"Deleted document with ID: {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            raise
    
    async def get_document_count(self) -> int:
        """Get the number of documents in the retriever"""
        try:
            # Get count from vector store
            return self.retriever.vectorstore._collection.count()
        except Exception as e:
            logger.error(f"Error getting document count: {e}")
            return 0
    
    async def clear_all_documents(self) -> bool:
        """Clear all documents from the retriever"""
        try:
            # Clear document store
            self.retriever.docstore.clear()
            
            # Clear vector store
            self.retriever.vectorstore._collection.delete()
            
            logger.info("Cleared all documents from multimodal retriever")
            return True
            
        except Exception as e:
            logger.error(f"Error clearing documents: {e}")
            raise
