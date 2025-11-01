from sqlmodel import Field, Relationship, SQLModel
from typing import Optional

class Label(SQLModel, table=True):
    __tablename__ = "label"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(...)
    solution: Optional[str] = None

    annotations: list["Annotation"] = Relationship(back_populates="label")
