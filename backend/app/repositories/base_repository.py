from sqlmodel import Session
from app.database import get_session
from fastapi import Depends

class BaseRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def save(self, obj):
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj
    
    def get_all(self):
        pass

    def get_by_id(self, id):
        pass

    def delete_by_id(self, id):
        pass

