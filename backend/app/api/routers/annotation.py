from fastapi import APIRouter, Depends, Response, status
from fastapi_utils.cbv import cbv
from sqlmodel import Session
from app.database import get_session
from app.models import Annotation
from app.schemas import AnnotationInput
from app.repositories import AnnotationRepostitory
# http://localhost:8000/label
router = APIRouter(prefix="/annotations", tags=["Annotation"])

@cbv(router)
class AnnotationRouter:
    annotationRepository: AnnotationRepostitory = Depends(AnnotationRepostitory)

    @router.get("/")
    def get_all_annotations(self):
        annotations = self.annotationRepository.get_all()
        return annotations
    
    @router.post("/")
    def add_annotation(self, form: AnnotationInput):
        annotation = Annotation(**form.model_dump())
        self.annotationRepository.save(annotation)
        return annotation
    
    @router.delete("/{id:int}")
    def delete_annotation(self, id: int):
        ok = self.annotationRepository.delete_by_id(id)
        if not ok:
            return Response(status_code=status.HTTP_404_NOT_FOUND)
        return Response(status_code=status.HTTP_204_NO_CONTENT)