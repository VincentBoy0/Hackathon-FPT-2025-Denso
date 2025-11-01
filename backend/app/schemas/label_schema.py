from sqlmodel import SQLModel
from typing import Optional


class LabelCreate(SQLModel):
    name: str
    solution: Optional[str] = None

    class Config:
        from_attributes = True


class LabelOut(SQLModel):
    id: Optional[int] = None
    name: str
    solution: Optional[str] = None

    class Config:
        from_attributes = True