from collections.abc import Generator
from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


#---------------------------Settings------------------------------
SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{settings.database_username}:{settings.database_password}@localhost:{settings.database_port}/{settings.database_name}"
#-----------------------------------------------------------------

engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
