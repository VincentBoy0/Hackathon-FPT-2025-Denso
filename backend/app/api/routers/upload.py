import os, shutil, time
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_session
from fastapi import File, UploadFile
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.utils.image import count_images_by_label, get_label_name_by_id
from app.api.routers import image
from app.schemas import ImageStatus, ImageCreate
router = APIRouter(prefix="/upload", tags=["Upload"])

# Define upload directory relative to the backend root
BASE_DIR = Path(__file__).resolve().parents[3]
UPLOAD_DIR = BASE_DIR / "static" / "images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve static files
router.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

@router.post("/")
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_session)):
    print("file", file)
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    

    timestamp = int(time.time() * 1000)  # e.g., 1734893459000
    original_extension = Path(file.filename).suffix
    safe_filename = f"{timestamp}{original_extension}"

    file_path = UPLOAD_DIR / safe_filename
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")

    file_url = f"/static/images/{safe_filename}"

    img = image.upload_image(ImageCreate(url=file_url, status=ImageStatus.ready), db)
    return img
