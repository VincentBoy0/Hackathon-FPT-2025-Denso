from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_session
from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
import os, shutil, time
from pathlib import Path
from app.api.utils.image import count_images_by_label, get_label_name_by_id
from app.api.routers import image
from app.schemas.images import ImageStatus, ImageInput
router = APIRouter(prefix="/upload", tags=["Upload"])

# Define upload directory relative to the backend root
BASE_DIR = Path(__file__).resolve().parents[3]
UPLOAD_DIR = BASE_DIR / "static" / "images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve static files
router.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

# @router.post("/upload")
# async def upload_image(label_id: int, file: UploadFile = File(...), db: Session = Depends(get_session)):
#     # Validate file type
#     if not file.content_type.startswith('image/'):
#         raise HTTPException(status_code=400, detail="File must be an image")
    
#     label_name = get_label_name_by_id(db, label_id)
#     cnt = count_images_by_label(db, label_id)

#     file_name = label_name + str(cnt + 1)
#     original_extension = Path(file.filename).suffix
#     safe_filename = f"{file_name}{original_extension}"
    
#     file_path = UPLOAD_DIR / safe_filename
    
#     try:
#         with open(file_path, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")

#     file_url = f"/static/images/{safe_filename}"
#     return {"url": file_url}

@router.post("/")
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_session)):
    # Validate file type
    print("file", file)
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    

    timestamp = int(time.time() * 1000)  # e.g., 1734893459000
    original_extension = Path(file.filename).suffix
    safe_filename = f"{timestamp}{original_extension}"
    # original_extension = Path(file.filename).suffix
    # safe_filename = f"{file_name}{original_extension}"
    
    file_path = UPLOAD_DIR / safe_filename
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")

    file_url = f"/static/images/{safe_filename}"
    # img = ImageInput(url=file_url, status=ImageStatus.ready)
    # print("img", img)
    img = image.upload_image(ImageInput(url=file_url, status=ImageStatus.ready), db)
    return img
