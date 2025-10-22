from sqlmodel import Field, Relationship, SQLModel
from datetime import date, datetime
from typing import Optional
from enum import Enum
from sqlalchemy import Index, JSON, Column


class ImageStatus(str, Enum):
    ready = "Ready"
    progress = "Progress"
    review = "Review"
    approve = "Approve"

class Image(SQLModel, table=True):
    __tablename__ = "image_assets"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(..., max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    status: ImageStatus = Field(default=ImageStatus.ready, index=True)
    annotation: Optional["Annotation"] = Relationship(back_populates="image")

    # Create indexes for frequently queried fields
    __table_args__ = (
        Index("ix_image_assets_status_created", "status", "created_at"),
    )

class Label(SQLModel, table=True):
    __tablename__ = "label"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(...)
    solution: Optional[str] = None
    annotations: list["Annotation"] = Relationship(back_populates="label")

class Annotation(SQLModel, table=True):
    __tablename__ = "annotations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    bounding_box: Optional[str] = Field(
        default=None,
        sa_column=Column(JSON)
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    image_id: Optional[int] = Field(default=None, foreign_key="image_assets.id")
    label_id: Optional[int] = Field(default=None, foreign_key="label.id")
    
    # Relationships
    image: Optional[Image] = Relationship(back_populates="annotation")
    label: Optional[Label] = Relationship(back_populates="annotations")