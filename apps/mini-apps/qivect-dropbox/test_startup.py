#!/usr/bin/env python3
"""
Simple test script for the dropbox app.
This script tests if the app can start and respond to basic requests.
"""

import requests
import time
import subprocess
import sys
from pathlib import Path

def test_app():
    """Test the dropbox app startup and basic functionality."""
    print("Testing qivect-dropbox app...")
    
    # Start the app
    app_path = Path(__file__).parent / "app.py"
    try:
        process = subprocess.Popen([sys.executable, str(app_path)], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE)
        
        # Wait a moment for the app to start
        time.sleep(2)
        
        # Test basic endpoints
        try:
            response = requests.get("http://127.0.0.1:5000/", timeout=5)
            if response.status_code == 200:
                print("✅ App started successfully")
                print(f"Response: {response.json()}")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to connect to app: {e}")
            
        # Test health endpoint
        try:
            response = requests.get("http://127.0.0.1:5000/health", timeout=5)
            if response.status_code == 200:
                print("✅ Health endpoint working")
                print(f"Health response: {response.json()}")
            else:
                print(f"❌ Health endpoint failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Health endpoint failed: {e}")
            
    except Exception as e:
        print(f"❌ Failed to start app: {e}")
    finally:
        # Clean up
        try:
            process.terminate()
            process.wait(timeout=5)
        except:
            process.kill()

if __name__ == "__main__":
    test_app()
