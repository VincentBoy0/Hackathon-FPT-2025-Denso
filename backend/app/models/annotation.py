from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime
from typing import Optional
from sqlalchemy import JSON, Column

class Annotation(SQLModel, table=True):
    __tablename__ = "annotations"

    id: Optional[int] = Field(default=None, primary_key=True)
    bounding_box: Optional[str] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    image_id: Optional[int] = Field(default=None, foreign_key="image_assets.id")
    label_id: Optional[int] = Field(default=None, foreign_key="label.id")

    image: Optional["Image"] = Relationship(back_populates="annotation")
    label: Optional["Label"] = Relationship(back_populates="annotations")
