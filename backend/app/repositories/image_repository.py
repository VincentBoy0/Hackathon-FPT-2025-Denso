from typing import List
from app.repositories.base_repository import BaseRepository
from sqlmodel import Session, select
from app.models import Image

class ImageRepository(BaseRepository):
    def get_all(self) -> List[Image]:
        return list(self.db.exec(select(Image)))
    
    def get_by_id(self, id: int) -> Image:
        return self.db.get(Image, id)
    
    def delete_by_id(self, id) -> bool:
        image = self.get_by_id(id)
        if not image:
            return False
        self.db.delete(image)
        self.db.commit()
        return True