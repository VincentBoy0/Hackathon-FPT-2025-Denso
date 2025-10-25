from fastapi import FastAPI
from sqlmodel import SQLModel
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import (
    test, image, label, annotation, upload, inference
)
from app.database import engine

app = FastAPI()
origins = [
    'http://localhost:3000',
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # List of allowed origins
    allow_credentials=True,      # Allow cookies to be sent with requests
    allow_methods=["*"],         # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],         # Allow all headers (e.g., Content-Type, Authorization)
)

#---------------------------------- Routers -------------------------------------------------------
app.include_router(test.router)
app.include_router(image.router)
app.include_router(label.router)
app.include_router(annotation.router)
app.include_router(upload.router)
app.include_router(inference.router)
#--------------------------------------------------------------------------------------------------


# setting up database to connect with postgres
@app.on_event("startup")
async def on_startup():
    SQLModel.metadata.create_all(engine)
