from sqlmodel import Field, Relationship, SQLModel
from datetime import date, datetime
from typing import Dict, Optional
from enum import Enum
from sqlalchemy import Index, JSON, Column


class ImageStatus(str, Enum):
    ready = "Ready"
    progress = "Progress"
    review = "Review"
    approve = "Approve"

class ImageInfo(SQLModel):
    # id: Optional[int] = None
    # created_at: datetime
    url: str 
    status: ImageStatus
    label: str 
    bounding_box: Dict

    class Config:
        from_attributes = True

class ImageInput(SQLModel):
    url: str
    stauts: ImageStatus

    class Config:
        from_attributes = True