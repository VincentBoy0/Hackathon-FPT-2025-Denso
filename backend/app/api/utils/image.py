from sqlmodel import Session, select, func
from app.models.image import Image
from app.models.label import Label
from app.models.annotation import Annotation
from typing import Optional


def count_images_by_label(db: Session, label_id: int) -> dict:
    result = db.exec(
        select(func.count(Annotation.id))
        .join(Label, Annotation.label_id == Label.id)
        .where(Label.id == label_id)
    ).first()
    return result


def get_label_name_by_id(db: Session, label_id: int):
    result = db.get(Label, label_id)
    return result.name