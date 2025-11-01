from sqlmodel import SQLModel
from datetime import date, datetime
from typing import Dict, Optional
from enum import Enum
# from app.models import ImageStatus

class AnnotationInput(SQLModel):
    image_id: int
    label_id: int
    bounding_box: Dict

    class Config:
        from_attributes = True