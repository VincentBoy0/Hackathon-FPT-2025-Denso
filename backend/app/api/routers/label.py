from fastapi import APIRouter, Depends, Response, status
from sqlmodel import Session
from fastapi_utils.cbv import cbv
from app.database import get_session
from app.models import Label
from app.schemas import LabelCreate
from app.repositories import LabelRepository

# http://localhost:8000/label
router = APIRouter(prefix="/labels", tags=["Label"])

@cbv(router)
class LabelRouter:
    # db: Session = Depends(get_session)
    labelRepository: LabelRepository = Depends(LabelRepository)

    @router.get("/")
    def get_all_labels(self):
        labels = self.labelRepository.get_all()
        return labels

    @router.post("/")
    def add_label(self, input: LabelCreate):
        if (input.solution):
            new_label = Label(**input.model_dump())
        else:
            new_label = Label(name=input.name)
        self.labelRepository.save(new_label)
        return new_label

    @router.delete("/{id}")
    def delete_label(self, id: int):
        ok = self.labelRepository.delete_by_id(id)
        if not ok:
            return Response(status_code=status.HTTP_404_NOT_FOUND)
        return Response(status_code=status.HTTP_204_NO_CONTENT)