from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session
from app.models.images import Label
from sqlalchemy import select, func


router = APIRouter(prefix="/label", tags=["Label"])

@router.get("/")
def get_all_labels(db: Session = Depends(get_session)):
    labels = db.exec(select(Label)).scalars().all()
    return labels