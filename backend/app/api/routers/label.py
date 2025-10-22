from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session
from app.models.images import Label
from sqlalchemy import select, func
from app.schemas.label import LabelSchema

# http://localhost:8000/label
router = APIRouter(prefix="/label", tags=["Label"])

@router.get("/")
def get_all_labels(db: Session = Depends(get_session)):
    labels = db.exec(select(Label)).scalars().all()
    return labels

@router.post("/")
def add_label(input: LabelSchema, db: Session = Depends(get_session)):
    if (input.solution):
        new_label = Label(**input.model_dump())
    else:
        new_label = Label(name=input.name)
    db.add(new_label)
    db.commit()
    db.refresh(new_label)
    return new_label
