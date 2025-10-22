from sqlmodel import Field, Relationship, SQLModel
from typing import Optional

class LabelSchema(SQLModel):
    name: str 
    solution: Optional[str] = None

    class Config:
        from_attibutes = True