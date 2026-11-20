"""
EcoCampus Backend Entry Point
Starts Uvicorn ASGI server with automatic reload for development.
"""
import uvicorn
import os
import sys

# Ensure ecocampus-backend root is in Python sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🌿 EcoCampus FastAPI Backend Starting on http://127.0.0.1:8000")
    print("📖 Interactive Swagger API Docs: http://127.0.0.1:8000/docs")
    print("=" * 50 + "\n")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
