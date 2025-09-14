#!/usr/bin/env python3
"""
Simple startup script for testing the RAG application locally.
This script sets up basic environment variables and starts the FastAPI server.
"""

import os
import sys
from pathlib import Path

# Add the app directory to the Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

# Set basic environment variables if not already set
os.environ.setdefault("DATA_ROOT", str(Path(__file__).parent / "data"))
os.environ.setdefault("QDRANT_HOST", "localhost")
os.environ.setdefault("QDRANT_PORT", "6333")
os.environ.setdefault("EMBEDDING_MODEL", "bge-small-en-v1.5")
os.environ.setdefault("OLLAMA_MODEL", "llama3.1:8b")
os.environ.setdefault("TIER_COLLECTIONS", "UNCLASS:q_unclass,CLASSIFIED:q_classified")
os.environ.setdefault("FOLDER_TIERS", "unclass:UNCLASS,classified:CLASSIFIED")
os.environ.setdefault("TIER_POLICIES", '{"UNCLASS": true, "CLASSIFIED": true}')
os.environ.setdefault("CHUNK_SIZE", "800")
os.environ.setdefault("CHUNK_OVERLAP", "100")
os.environ.setdefault("TOP_K", "5")
os.environ.setdefault("CLOUD_REQUEST_TIMEOUT", "30")

# Create data directory if it doesn't exist
data_dir = Path(os.environ["DATA_ROOT"])
data_dir.mkdir(exist_ok=True)

if __name__ == "__main__":
    print("Starting RAG application in simple mode...")
    print(f"Data directory: {data_dir}")
    print("Note: This requires Qdrant to be running on localhost:6333")
    print("You can start Qdrant with: docker run -p 6333:6333 qdrant/qdrant")
    print()
    
    try:
        import uvicorn
        from main import app
        
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Please install requirements: pip install -r requirements.txt")
    except Exception as e:
        print(f"Failed to start application: {e}")
        print("Make sure Qdrant is running and all dependencies are installed.")
