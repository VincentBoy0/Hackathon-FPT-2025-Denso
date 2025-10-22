from fastapi import APIRouter, Depends
from sentry_sdk import end_session
from sqlmodel import Session
from app import database
from app.models.images import Image, Annotation

router = APIRouter(prefix="/image", tags=["Image"])


@router.post("/")
def upload_image(db: Session = Depends(end_session)):
    pass