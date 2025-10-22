from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session

router = APIRouter(prefix="/test", tags=["Test"])


@router.get("/")
def main(db: Session = Depends(get_session)):
    return {"message": "Welcome to FastAPI Base Project"}