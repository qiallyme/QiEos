"""
Advanced Document Processor for Automated Multimodal Data Ingestion
Handles chat transcripts, activity data, memory data, images, videos, and other file types
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from urllib.parse import urlparse

import pandas as pd
from PIL import Image
import cv2
import numpy as np

from langchain.schema import Document
from langchain_community.document_loaders import (
    TextLoader, 
    CSVLoader, 
    JSONLoader,
    UnstructuredFileLoader,
    PyPDFLoader,
    Docx2txtLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings

from .config import Settings
from .rag_engine import RAGEngine

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Advanced document processor for automated multimodal data ingestion"""
    
    def __init__(self):
        self.settings = Settings()
        self.rag_engine = RAGEngine()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        
        # Supported file types
        self.supported_text_types = {
            '.txt', '.md', '.json', '.csv', '.tsv', '.xml', '.html', '.htm'
        }
        self.supported_document_types = {
            '.pdf', '.docx', '.doc', '.rtf', '.odt'
        }
        self.supported_image_types = {
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'
        }
        self.supported_video_types = {
            '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'
        }
        self.supported_audio_types = {
            '.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'
        }
        
        # Initialize multimodal embedding model
        self.multimodal_embeddings = None
        self._initialize_multimodal_embeddings()
    
    def _initialize_multimodal_embeddings(self):
        """Initialize multimodal embedding model"""
        try:
            # Try to initialize Google Gemini for multimodal embeddings
            import google.generativeai as genai
            genai.configure(api_key=self.settings.gemini_api_key)
            self.multimodal_embeddings = genai.GenerativeModel('gemini-pro-vision')
            logger.info("Multimodal embeddings (Gemini) initialized successfully")
        except ImportError:
            logger.warning("Google Gemini not available for multimodal embeddings")
        except Exception as e:
            logger.error(f"Failed to initialize multimodal embeddings: {e}")
    
    async def process_document(
        self, 
        file_path: str, 
        client_id: str, 
        document_type: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Process a document and add it to the RAG system"""
        try:
            file_path = Path(file_path)
            
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Determine file type if not provided
            if not document_type:
                document_type = self._determine_file_type(file_path)
            
            # Extract metadata
            if not metadata:
                metadata = self._extract_file_metadata(file_path)
            
            # Process based on file type
            if document_type in ['text', 'document']:
                documents = await self._process_text_document(file_path, client_id, metadata)
            elif document_type == 'image':
                documents = await self._process_image(file_path, client_id, metadata)
            elif document_type == 'video':
                documents = await self._process_video(file_path, client_id, metadata)
            elif document_type == 'audio':
                documents = await self._process_audio(file_path, client_id, metadata)
            elif document_type == 'chat_transcript':
                documents = await self._process_chat_transcript(file_path, client_id, metadata)
            elif document_type == 'activity_data':
                documents = await self._process_activity_data(file_path, client_id, metadata)
            elif document_type == 'memory_data':
                documents = await self._process_memory_data(file_path, client_id, metadata)
            else:
                raise ValueError(f"Unsupported document type: {document_type}")
            
            # Add documents to RAG system
            chunks_processed = await self.rag_engine.add_documents(documents, client_id)
            
            return {
                "status": "success",
                "document_type": document_type,
                "chunks_processed": chunks_processed,
                "file_path": str(file_path),
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Document processing error: {e}")
            raise
    
    def _determine_file_type(self, file_path: Path) -> str:
        """Determine the type of file based on extension"""
        extension = file_path.suffix.lower()
        
        if extension in self.supported_text_types:
            return 'text'
        elif extension in self.supported_document_types:
            return 'document'
        elif extension in self.supported_image_types:
            return 'image'
        elif extension in self.supported_video_types:
            return 'video'
        elif extension in self.supported_audio_types:
            return 'audio'
        else:
            return 'text'  # Default to text
    
    def _extract_file_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Extract metadata from file"""
        stat = file_path.stat()
        
        return {
            "file_name": file_path.name,
            "file_path": str(file_path),
            "file_size": stat.st_size,
            "created_date": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified_date": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "file_extension": file_path.suffix.lower(),
            "document_type": self._determine_file_type(file_path)
        }
    
    async def _process_text_document(
        self, 
        file_path: Path, 
        client_id: str, 
        metadata: Dict
    ) -> List[Document]:
        """Process text and document files"""
        try:
            extension = file_path.suffix.lower()
            
            # Choose appropriate loader
            if extension == '.pdf':
                loader = PyPDFLoader(str(file_path))
            elif extension in ['.docx', '.doc']:
                loader = Docx2txtLoader(str(file_path))
            elif extension == '.csv':
                loader = CSVLoader(str(file_path))
            elif extension == '.json':
                loader = JSONLoader(
                    file_path=str(file_path),
                    jq_schema='.[]',
                    text_content=False
                )
            else:
                loader = TextLoader(str(file_path))
            
            # Load documents
            documents = loader.load()
            
            # Add metadata
            for doc in documents:
                doc.metadata.update(metadata)
                doc.metadata.update({
                    "client_id": client_id,
                    "source": "file_upload",
                    "processing_date": datetime.now().isoformat()
                })
            
            # Split documents
            split_docs = self.text_splitter.split_documents(documents)
            
            return split_docs
            
        except Exception as e:
            logger.error(f"Text document processing error: {e}")
            raise
    
    async def _process_image(
        self, 
        file_path: Path, 
        client_id: str, 
        metadata: Dict
    ) -> List[Document]:
        """Process image files using multimodal embeddings"""
        try:
            # Load image
            image = Image.open(file_path)
            
            # Generate image description using multimodal model
            if self.multimodal_embeddings:
                image_description = await self._generate_image_description(image)
            else:
                # Fallback: use basic image analysis
                image_description = self._analyze_image_basic(image)
            
            # Create document from image description
            document = Document(
                page_content=image_description,
                metadata={
                    **metadata,
                    "client_id": client_id,
                    "source": "image_upload",
                    "processing_date": datetime.now().isoformat(),
                    "image_width": image.width,
                    "image_height": image.height,
                    "image_mode": image.mode,
                    "file_path": str(file_path)
                }
            )
            
            # Split if description is long
            split_docs = self.text_splitter.split_documents([document])
            
            return split_docs
            
        except Exception as e:
            logger.error(f"Image processing error: {e}")
            raise
    
    async def _process_video(
        self, 
        file_path: Path, 
        client_id: str, 
        metadata: Dict
    ) -> List[Document]:
        """Process video files by extracting keyframes"""
        try:
            # Open video file
            cap = cv2.VideoCapture(str(file_path))
            
            if not cap.isOpened():
                raise ValueError(f"Could not open video file: {file_path}")
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps if fps > 0 else 0
            
            # Extract keyframes (one frame per 30 seconds)
            keyframe_interval = int(fps * 30)  # 30 seconds
            keyframes = []
            frame_descriptions = []
            
            frame_idx = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                if frame_idx % keyframe_interval == 0:
                    # Convert BGR to RGB
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    keyframes.append(frame_rgb)
                    
                    # Generate description for this frame
                    if self.multimodal_embeddings:
                        frame_description = await self._generate_image_description(
                            Image.fromarray(frame_rgb)
                        )
                    else:
                        frame_description = f"Video frame at {frame_idx/fps:.1f} seconds"
                    
                    frame_descriptions.append(frame_description)
                
                frame_idx += 1
            
            cap.release()
            
            # Create document from video analysis
            video_content = f"Video Analysis:\nDuration: {duration:.1f} seconds\nFPS: {fps}\nTotal Frames: {frame_count}\n\nKeyframe Descriptions:\n"
            for i, desc in enumerate(frame_descriptions):
                timestamp = (i * keyframe_interval) / fps
                video_content += f"Frame at {timestamp:.1f}s: {desc}\n"
            
            document = Document(
                page_content=video_content,
                metadata={
                    **metadata,
                    "client_id": client_id,
                    "source": "video_upload",
                    "processing_date": datetime.now().isoformat(),
                    "video_duration": duration,
                    "video_fps": fps,
                    "video_frame_count": frame_count,
                    "keyframes_extracted": len(keyframes),
                    "file_path": str(file_path)
                }
            )
            
            # Split if content is long
            split_docs = self.text_splitter.split_documents([document])
            
            return split_docs
            
        except Exception as e:
            logger.error(f"Video processing error: {e}")
            raise
    
    async def _process_audio(
        self, 
        file_path: Path, 
        client_id: str, 
        metadata: Dict
    ) -> List[Document]:
        """Process audio files (placeholder for future implementation)"""
        try:
            # For now, create a basic document with audio metadata
            # In the future, this could use speech-to-text or audio analysis
            audio_content = f"Audio file: {file_path.name}\nType: {metadata.get('document_type', 'audio')}\nSize: {metadata.get('file_size', 0)} bytes"
            
            document = Document(
                page_content=audio_content,
                metadata={
                    **metadata,
                    "client_id": client_id,
                    "source": "audio_upload",
                    "processing_date": datetime.now().isoformat(),
                    "file_path": str(file_path)
                }
            )
            
            return [document]
            
        except Exception as e:
            logger.error(f"Audio processing error: {e}")
            raise
    
    async def _process_chat_transcript(
        self, 
        file_path: Path, 
        client_id: str, 
        metadata: Dict
    ) -> List[Document]:
        """Process chat transcript data"""
        try:
            # Load chat data
            if file_path.suffix.lower() == '.json':
                with open(file_path, 'r', encoding='utf-8') as f:
                    chat_data = json.load(f)
            elif file_path.suffix.lower() == '.csv':
                chat_data = pd.read_csv(file_path).to_dict('records')
            else:
                # Assume text file with chat format
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                chat_data = self._parse_chat_text(content)
            
            # Convert to documents
            documents = []
            for entry in chat_data:
                # Extract message content and metadata
                message = entry.get('message', entry.get('content', str(entry)))
                timestamp = entry.get('timestamp', entry.get('date', ''))
                sender = entry.get('sender', entry.get('user', 'unknown'))
                
                # Create document
                doc_content = f"Chat Message from {sender} at {timestamp}:\n{message}"
                
                document = Document(
                    page_content=doc_content,
                    metadata={
                        **metadata,
                        "client_id": client_id,
                        "source": "chat_transcript",
                        "processing_date": datetime.now().isoformat(),
                        "chat_sender": sender,
                        "chat_timestamp": timestamp,
                        "message_type": entry.get('type', 'text')
                    }
                )
                documents.append(document)
            
            # Split documents
            split_docs = self.text_splitter.split_documents(documents)
            
            return split_docs
            
        except Exception as e:
            logger.error(f"Chat transcript processing error: {e}")
            raise
    
    async def _process_activity_data(
        self, 
        file_path: Path, 
        client_id: str, 
        metadata: Dict
    ) -> List[Document]:
        """Process activity tracker data"""
        try:
            # Load activity data
            if file_path.suffix.lower() == '.json':
                with open(file_path, 'r', encoding='utf-8') as f:
                    activity_data = json.load(f)
            elif file_path.suffix.lower() == '.csv':
                activity_data = pd.read_csv(file_path).to_dict('records')
            else:
                raise ValueError(f"Unsupported format for activity data: {file_path.suffix}")
            
            # Convert to documents
            documents = []
            for entry in activity_data:
                # Extract activity information
                activity_type = entry.get('type', entry.get('activity_type', 'unknown'))
                timestamp = entry.get('timestamp', entry.get('date', ''))
                duration = entry.get('duration', entry.get('time', ''))
                calories = entry.get('calories', entry.get('energy', ''))
                distance = entry.get('distance', '')
                steps = entry.get('steps', '')
                
                # Create descriptive content
                content_parts = [f"Activity: {activity_type}"]
                if timestamp:
                    content_parts.append(f"Time: {timestamp}")
                if duration:
                    content_parts.append(f"Duration: {duration}")
                if calories:
                    content_parts.append(f"Calories: {calories}")
                if distance:
                    content_parts.append(f"Distance: {distance}")
                if steps:
                    content_parts.append(f"Steps: {steps}")
                
                doc_content = " | ".join(content_parts)
                
                document = Document(
                    page_content=doc_content,
                    metadata={
                        **metadata,
                        "client_id": client_id,
                        "source": "activity_data",
                        "processing_date": datetime.now().isoformat(),
                        "activity_type": activity_type,
                        "activity_timestamp": timestamp,
                        "activity_duration": duration,
                        "activity_calories": calories,
                        "activity_distance": distance,
                        "activity_steps": steps
                    }
                )
                documents.append(document)
            
            # Split documents
            split_docs = self.text_splitter.split_documents(documents)
            
            return split_docs
            
        except Exception as e:
            logger.error(f"Activity data processing error: {e}")
            raise
    
    async def _process_memory_data(
        self, 
        file_path: Path, 
        client_id: str, 
        metadata: Dict
    ) -> List[Document]:
        """Process memory/journal data"""
        try:
            # Load memory data
            if file_path.suffix.lower() == '.json':
                with open(file_path, 'r', encoding='utf-8') as f:
                    memory_data = json.load(f)
            elif file_path.suffix.lower() == '.csv':
                memory_data = pd.read_csv(file_path).to_dict('records')
            else:
                # Assume text file with journal entries
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                memory_data = self._parse_journal_text(content)
            
            # Convert to documents
            documents = []
            for entry in memory_data:
                # Extract memory content and metadata
                text = entry.get('text', entry.get('content', entry.get('memory', str(entry))))
                timestamp = entry.get('timestamp', entry.get('date', ''))
                mood = entry.get('mood', entry.get('emotion', ''))
                tags = entry.get('tags', entry.get('categories', []))
                
                # Create document
                doc_content = f"Memory Entry from {timestamp}:\n{text}"
                if mood:
                    doc_content += f"\nMood: {mood}"
                if tags:
                    doc_content += f"\nTags: {', '.join(tags) if isinstance(tags, list) else tags}"
                
                document = Document(
                    page_content=doc_content,
                    metadata={
                        **metadata,
                        "client_id": client_id,
                        "source": "memory_data",
                        "processing_date": datetime.now().isoformat(),
                        "memory_timestamp": timestamp,
                        "memory_mood": mood,
                        "memory_tags": tags if isinstance(tags, list) else [tags] if tags else []
                    }
                )
                documents.append(document)
            
            # Split documents
            split_docs = self.text_splitter.split_documents(documents)
            
            return split_docs
            
        except Exception as e:
            logger.error(f"Memory data processing error: {e}")
            raise
    
    async def _generate_image_description(self, image: Image.Image) -> str:
        """Generate description for an image using multimodal model"""
        try:
            if self.multimodal_embeddings:
                prompt = "Describe this image in detail, including objects, people, actions, colors, and any text visible."
                response = self.multimodal_embeddings.generate_content([prompt, image])
                return response.text
            else:
                return "Image description not available (multimodal model not initialized)"
        except Exception as e:
            logger.error(f"Image description generation error: {e}")
            return f"Image analysis failed: {str(e)}"
    
    def _analyze_image_basic(self, image: Image.Image) -> str:
        """Basic image analysis without multimodal model"""
        return f"Image: {image.width}x{image.height} pixels, mode: {image.mode}"
    
    def _parse_chat_text(self, content: str) -> List[Dict]:
        """Parse chat text into structured format"""
        lines = content.split('\n')
        chat_entries = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Simple parsing - can be enhanced based on actual format
            if ':' in line:
                parts = line.split(':', 2)
                if len(parts) >= 2:
                    chat_entries.append({
                        'sender': parts[0].strip(),
                        'message': parts[1].strip(),
                        'timestamp': datetime.now().isoformat()
                    })
            else:
                chat_entries.append({
                    'sender': 'unknown',
                    'message': line,
                    'timestamp': datetime.now().isoformat()
                })
        
        return chat_entries
    
    def _parse_journal_text(self, content: str) -> List[Dict]:
        """Parse journal text into structured format"""
        # Split by date patterns or other delimiters
        entries = []
        
        # Simple parsing - can be enhanced based on actual format
        lines = content.split('\n')
        current_entry = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line starts with date pattern
            if any(pattern in line.lower() for pattern in ['2024', '2023', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']):
                # Save previous entry
                if current_entry:
                    entries.append({
                        'text': current_entry.strip(),
                        'timestamp': datetime.now().isoformat(),
                        'mood': '',
                        'tags': []
                    })
                current_entry = line
            else:
                current_entry += " " + line
        
        # Add last entry
        if current_entry:
            entries.append({
                'text': current_entry.strip(),
                'timestamp': datetime.now().isoformat(),
                'mood': '',
                'tags': []
            })
        
        return entries
    
    async def list_documents(self, client_id: str) -> List[Dict]:
        """List documents for a client"""
        try:
            # This would typically query a database or file system
            # For now, return basic information
            return [
                {
                    "client_id": client_id,
                    "document_count": await self.rag_engine.get_document_count(client_id),
                    "last_updated": datetime.now().isoformat()
                }
            ]
        except Exception as e:
            logger.error(f"List documents error: {e}")
            raise
    
    async def delete_document(self, client_id: str, document_id: str) -> bool:
        """Delete a document from the RAG system"""
        try:
            # This would typically delete from database and vector store
            # For now, return success
            logger.info(f"Deleted document {document_id} for client {client_id}")
            return True
        except Exception as e:
            logger.error(f"Delete document error: {e}")
            raise
    
    async def process_batch(
        self, 
        files: List[Dict], 
        client_id: str
    ) -> Dict[str, Any]:
        """Process multiple files in batch"""
        try:
            results = []
            total_chunks = 0
            
            for file_info in files:
                try:
                    result = await self.process_document(
                        file_path=file_info['path'],
                        client_id=client_id,
                        document_type=file_info.get('type'),
                        metadata=file_info.get('metadata')
                    )
                    results.append(result)
                    total_chunks += result['chunks_processed']
                except Exception as e:
                    logger.error(f"Failed to process file {file_info['path']}: {e}")
                    results.append({
                        "status": "error",
                        "file_path": file_info['path'],
                        "error": str(e)
                    })
            
            return {
                "status": "completed",
                "total_files": len(files),
                "successful_files": len([r for r in results if r['status'] == 'success']),
                "failed_files": len([r for r in results if r['status'] == 'error']),
                "total_chunks_processed": total_chunks,
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Batch processing error: {e}")
            raise
