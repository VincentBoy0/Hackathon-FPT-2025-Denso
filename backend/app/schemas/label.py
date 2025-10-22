from sqlmodel import SQLModel
from typing import Optional


class LabelSchema(SQLModel):
    id: Optional[int] = None
    name: str
    solution: Optional[str] = None

    class Config:
        from_attributes = True