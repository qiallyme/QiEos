"""
Modern Multi-Tenant RAG System
Built with FastAPI, ChromaDB, LangChain, and Supabase
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import AsyncGenerator, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import uvicorn

from .auth import get_current_user, User
from .rag_engine import RAGEngine
from .document_processor import DocumentProcessor
from .config import Settings
from .modular_architecture import modular_arch, AppMode
from .glassmorphism_ui import glassmorphism_ui, GlassEffect, GlowEffect

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize settings
settings = Settings()

# Initialize FastAPI app
app = FastAPI(
    title="Modern RAG API",
    description="Multi-tenant RAG system with ChromaDB and LangChain",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core components
rag_engine = RAGEngine()
document_processor = DocumentProcessor()

# Pydantic models
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    client_id: Optional[str] = None
    use_streaming: bool = True
    max_tokens: int = Field(default=1000, ge=1, le=4000)

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict]
    metadata: Dict

class DocumentUploadRequest(BaseModel):
    file_path: str
    client_id: str
    document_type: Optional[str] = "general"

class DocumentUploadResponse(BaseModel):
    status: str
    document_id: str
    chunks_processed: int

class HealthResponse(BaseModel):
    status: str
    components: Dict[str, str]

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Check ChromaDB connection
        chroma_status = "healthy" if rag_engine.is_connected() else "unhealthy"
        
        return HealthResponse(
            status="healthy",
            components={
                "chromadb": chroma_status,
                "langchain": "healthy",
                "supabase": "healthy"  # Add actual check
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Chat endpoint with optional streaming"""
    try:
        # Use authenticated user's client_id if not provided
        client_id = request.client_id or current_user.client_id
        
        if request.use_streaming:
            # Return streaming response
            return StreamingResponse(
                stream_chat_response(request.message, client_id, request.max_tokens),
                media_type="text/plain"
            )
        else:
            # Return regular response
            response = await rag_engine.chat(
                message=request.message,
                client_id=client_id,
                max_tokens=request.max_tokens
            )
            return ChatResponse(**response)
            
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def stream_chat_response(
    message: str, 
    client_id: str, 
    max_tokens: int
) -> AsyncGenerator[str, None]:
    """Stream chat response token by token"""
    try:
        async for chunk in rag_engine.stream_chat(
            message=message,
            client_id=client_id,
            max_tokens=max_tokens
        ):
            yield f"data: {json.dumps(chunk)}\n\n"
        
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        logger.error(f"Streaming error: {e}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@app.post("/ingest", response_model=DocumentUploadResponse)
async def ingest_document(
    request: DocumentUploadRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Ingest a document into the RAG system"""
    try:
        # Use authenticated user's client_id if not provided
        client_id = request.client_id or current_user.client_id
        
        # Start background processing
        background_tasks.add_task(
            document_processor.process_document,
            file_path=request.file_path,
            client_id=client_id,
            document_type=request.document_type
        )
        
        return DocumentUploadResponse(
            status="processing",
            document_id=f"doc_{client_id}_{hash(request.file_path)}",
            chunks_processed=0
        )
        
    except Exception as e:
        logger.error(f"Ingest error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{client_id}")
async def list_documents(
    client_id: str,
    current_user: User = Depends(get_current_user)
):
    """List documents for a client"""
    try:
        # Verify user has access to this client_id
        if current_user.client_id != client_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        documents = await document_processor.list_documents(client_id)
        return {"documents": documents}
        
    except Exception as e:
        logger.error(f"List documents error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{client_id}/{document_id}")
async def delete_document(
    client_id: str,
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a document from the RAG system"""
    try:
        # Verify user has access to this client_id
        if current_user.client_id != client_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        await document_processor.delete_document(client_id, document_id)
        return {"status": "deleted"}
        
    except Exception as e:
        logger.error(f"Delete document error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 3D Visualization Endpoints
@app.get("/visualization/{client_id}")
async def get_3d_visualization(
    client_id: str,
    method: str = "tsne",
    current_user: User = Depends(get_current_user)
):
    """Get 3D visualization data for documents"""
    try:
        # Verify user has access to this client_id
        if current_user.client_id != client_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        viz_data = await rag_engine.get_3d_visualization_data(client_id, method)
        return viz_data
        
    except Exception as e:
        logger.error(f"3D visualization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/visualization/{client_id}/query")
async def get_query_visualization(
    client_id: str,
    query: str,
    current_user: User = Depends(get_current_user)
):
    """Get visualization data highlighting relevant documents for a query"""
    try:
        # Verify user has access to this client_id
        if current_user.client_id != client_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        viz_data = await rag_engine.get_query_visualization(query, client_id)
        return viz_data
        
    except Exception as e:
        logger.error(f"Query visualization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Modern RAG API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Modular Architecture Endpoints
@app.get("/apps")
async def list_available_apps(
    current_user: User = Depends(get_current_user)
):
    """List available mini-apps for the current tenant"""
    try:
        apps = modular_arch.get_available_apps(current_user.client_id)
        return {
            "apps": [
                {
                    "name": app.name,
                    "version": app.version,
                    "description": app.description,
                    "mode": app.mode.value,
                    "dependencies": app.dependencies,
                    "exposed_components": app.exposed_components,
                    "api_endpoints": app.api_endpoints,
                    "permissions": app.permissions,
                    "metadata": app.metadata
                }
                for app in apps
            ]
        }
    except Exception as e:
        logger.error(f"Error listing apps: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/apps/{app_name}/instances")
async def create_app_instance(
    app_name: str,
    config: Optional[Dict] = None,
    current_user: User = Depends(get_current_user)
):
    """Create a new instance of a mini-app"""
    try:
        instance = modular_arch.create_app_instance(
            app_name=app_name,
            tenant_id=current_user.client_id,
            config=config or {}
        )
        
        return {
            "instance_id": instance.instance_id,
            "app_name": instance.manifest.name,
            "tenant_id": instance.tenant_id,
            "config": instance.config,
            "status": instance.status,
            "created_at": instance.created_at.isoformat()
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating app instance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/apps/instances")
async def list_app_instances(
    current_user: User = Depends(get_current_user)
):
    """List app instances for the current tenant"""
    try:
        instances = modular_arch.get_tenant_instances(current_user.client_id)
        return {
            "instances": [
                {
                    "instance_id": instance.instance_id,
                    "app_name": instance.manifest.name,
                    "tenant_id": instance.tenant_id,
                    "config": instance.config,
                    "status": instance.status,
                    "created_at": instance.created_at.isoformat(),
                    "last_accessed": instance.last_accessed.isoformat()
                }
                for instance in instances
            ]
        }
    except Exception as e:
        logger.error(f"Error listing app instances: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/apps/instances/{instance_id}/config")
async def update_app_config(
    instance_id: str,
    config: Dict,
    current_user: User = Depends(get_current_user)
):
    """Update configuration for an app instance"""
    try:
        instance = modular_arch.get_app_instance(instance_id)
        if not instance:
            raise HTTPException(status_code=404, detail="Instance not found")
        
        if instance.tenant_id != current_user.client_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        success = modular_arch.update_app_config(instance_id, config)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to update config")
        
        return {"status": "updated", "instance_id": instance_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating app config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/apps/instances/{instance_id}")
async def remove_app_instance(
    instance_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove an app instance"""
    try:
        instance = modular_arch.get_app_instance(instance_id)
        if not instance:
            raise HTTPException(status_code=404, detail="Instance not found")
        
        if instance.tenant_id != current_user.client_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        success = modular_arch.remove_app_instance(instance_id)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to remove instance")
        
        return {"status": "removed", "instance_id": instance_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing app instance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/apps/ui-config")
async def get_ui_config(
    current_user: User = Depends(get_current_user)
):
    """Get UI configuration for orchestrated mode"""
    try:
        ui_config = modular_arch.get_orchestrated_ui_config(current_user.client_id)
        return {"ui_config": ui_config}
    except Exception as e:
        logger.error(f"Error getting UI config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/apps/api/{endpoint}")
async def execute_app_api(
    endpoint: str,
    data: Optional[Dict] = None,
    current_user: User = Depends(get_current_user)
):
    """Execute an API call to a mini-app endpoint"""
    try:
        result = await modular_arch.execute_api_call(
            endpoint=endpoint,
            tenant_id=current_user.client_id,
            data=data
        )
        return {"result": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error executing app API: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/apps/statistics")
async def get_app_statistics(
    current_user: User = Depends(get_current_user)
):
    """Get statistics about the modular architecture"""
    try:
        stats = modular_arch.get_app_statistics()
        return stats
    except Exception as e:
        logger.error(f"Error getting app statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Glassmorphism UI Endpoints
@app.get("/ui/dashboard")
async def get_glassmorphism_dashboard(
    theme: str = "default",
    current_user: User = Depends(get_current_user)
):
    """Get glassmorphism dashboard HTML"""
    try:
        dashboard_html = glassmorphism_ui.generate_dashboard_template(theme)
        return {"html": dashboard_html}
    except Exception as e:
        logger.error(f"Error generating dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ui/styles")
async def get_glassmorphism_styles(
    theme: str = "default"
):
    """Get glassmorphism CSS styles"""
    try:
        css_styles = glassmorphism_ui.generate_css_styles(theme)
        return {"css": css_styles}
    except Exception as e:
        logger.error(f"Error generating styles: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ui/components")
async def get_glassmorphism_components():
    """Get React component templates"""
    try:
        components = glassmorphism_ui.generate_react_components()
        return components
    except Exception as e:
        logger.error(f"Error generating components: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ui/themes")
async def get_available_themes():
    """Get available glassmorphism themes"""
    try:
        themes = {
            name: {
                "name": theme.name,
                "background": theme.background,
                "accent_color": theme.accent_color,
                "glow_color": theme.glow_color
            }
            for name, theme in glassmorphism_ui.themes.items()
        }
        return {"themes": themes}
    except Exception as e:
        logger.error(f"Error getting themes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ui/card-styles")
async def get_card_styles(
    theme: str = "default",
    effect: GlassEffect = GlassEffect.FROSTED
):
    """Get glassmorphism card styles"""
    try:
        styles = glassmorphism_ui.generate_card_styles(theme, effect)
        return {"styles": styles}
    except Exception as e:
        logger.error(f"Error generating card styles: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ui/button-styles")
async def get_button_styles(
    theme: str = "default",
    glow_effect: GlowEffect = GlowEffect.NEON
):
    """Get glassmorphism button styles"""
    try:
        styles = glassmorphism_ui.generate_button_styles(theme, glow_effect)
        return {"styles": styles}
    except Exception as e:
        logger.error(f"Error generating button styles: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
