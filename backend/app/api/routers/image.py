from fastapi import APIRouter, Depends
from sentry_sdk import end_session
from sqlalchemy import select
from sqlmodel import Session
from app import database
from app.models.images import Image, Annotation, Label
from app.database import get_session
from app.schemas.images import ImageInfo, ImageInput

router = APIRouter(prefix="/image", tags=["Image"])


@router.post("/")
def upload_image(form: ImageInput, db: Session = Depends(get_session)):
    image = Image(**form.model_dump())
    db.add(image)
    db.commit()
    db.refresh(image)
    return image

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