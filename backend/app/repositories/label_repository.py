from typing import List
from app.repositories.base_repository import BaseRepository
from sqlmodel import select
from app.models import Label

class LabelRepository(BaseRepository):
    def get_all(self) -> List[Label]:
        return list(self.db.exec(select(Label)))
    
    def get_by_id(self, id: int) -> Label:
        return self.db.get(Label, id)
    
    def delete_by_id(self, id) -> bool:
        label = self.get_by_id(id)
        if not label:
            return False
        self.db.delete(label)
        self.db.commit()
        return True