from typing import List
from app.repositories.base_repository import BaseRepository
from sqlmodel import select
from app.models import Annotation

class AnnotationRepostitory(BaseRepository):
    def get_all(self) -> List[Annotation]:
        return list(self.db.exec(select(Annotation)))
    
    def get_by_id(self, id: int) -> Annotation:
        return self.db.get(Annotation, id)
    
    def delete_by_id(self, id) -> bool:
        annotation = self.get_by_id(id)
        if not annotation:
            return False
        self.db.delete(annotation)
        self.db.commit()
        return True