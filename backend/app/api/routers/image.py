import os
from fastapi_utils.cbv import cbv
from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import FileResponse
from sqlmodel import Session
from app.models import Image
from app.database import get_session
from app.schemas import ImageInfo, ImageCreate
from app.repositories import ImageRepository
router = APIRouter(prefix="/images", tags=["Image"])

@cbv(router)
class ImageRouter:
    # db: Session = Depends(get_session)
    imageRepository: ImageRepository = Depends(ImageRepository)

    @router.post("/")
    def upload_image(self, form: ImageCreate):
        image = Image(**form.model_dump())
        self.imageRepository.save(image)
        return image
    
    @router.get("/")
    def get_all_images(self):
        images = self.imageRepository.get_all()
        return images

    @router.get("/{filename}")
    def get_image(self, filename: str):
        file_path = os.path.join("/static/images", filename)
        if os.path.exists(file_path):
            return FileResponse(file_path)
        return {"error": "File not found"}
    
    @router.delete("/{id:int}")
    def delete_image(self, id: int):
        ok = self.imageRepository.delete_by_id(id)
        if not ok:
            return Response(status_code=status.HTTP_404_NOT_FOUND)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

# @router.get("/{image_id}")
# def get_image_info(image_id: int, db: Session =  Depends(get_session)):
#     image = db.exec(select(Image).
#                     join(Annotation).
#                     join(Label).
#                     where(Image.id == Annotation.image_id, Image.id == image_id, Label.id == Annotation.label_id).
#                     scalars().first())
#     info = ImageInfo(
#         url=image.url,
#         status=image.status,
#         label=image.name,
#         bounding_box=image.bounding_box
#     )
#     return info