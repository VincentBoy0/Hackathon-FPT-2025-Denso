"""
Entry point to run the FastAPI application with Uvicorn.
Run: python main.py
"""
import os
import sys
import traceback
import uvicorn
from fastapi import FastAPI

def get_app() -> FastAPI:
    try:
        # Try to import an existing FastAPI instance from app.main
        from app.main import app as imported_app  # type: ignore
        return imported_app
    except Exception:
        # Fallback: create a minimal FastAPI app with Swagger docs enabled
        print("Failed to import app.main - showing traceback:", file=sys.stderr)
        traceback.print_exc()
        app = FastAPI(title="Fallback API", docs_url="/docs", redoc_url="/redoc", openapi_url="/openapi.json")

        @app.get("/health", tags=["health"])
        async def health_check():
            return {"status": "ok"}

        return app

app = get_app()

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port, log_level="info")