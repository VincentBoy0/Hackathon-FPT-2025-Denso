from fastapi import APIRouter, Depends, Response, status
from sqlmodel import Session
from app.database import get_session
from app.models.images import Annotation
from sqlalchemy import select, func
from app.schemas.annoation import AnnotationInput

# http://localhost:8000/label
router = APIRouter(prefix="/annotation", tags=["Annotation"])

@router.post("/")
def add_annotation(form: AnnotationInput, db: Session = Depends(get_session)):
    annotation = Annotation(**form.model_dump())
    db.add(annotation)
    db.commit()
    db.refresh(annotation)
    return annotation