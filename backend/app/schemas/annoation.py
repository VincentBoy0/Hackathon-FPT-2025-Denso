from sqlmodel import SQLModel
from datetime import date, datetime
from typing import Dict, Optional
from enum import Enum


class ImageStatus(str, Enum):
    ready = "Ready"
    progress = "Progress"
    review = "Review"
    approve = "Approve"

class AnnotationInput(SQLModel):
    image_id: int
    label_id: int
    bounding_box: Dict

    class Config:
        from_attributes = True