from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

# --- Local SQLite (Fallback for standalone running) ---
# We use SQLite to ensure the project runs without requiring a heavy Postgres/Mongo installation.
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Mock MongoDB (To prevent connection errors without local DB) ---
class MockMongoDB:
    pass

mongo_db = MockMongoDB()

def get_mongo_db():
    return mongo_db
