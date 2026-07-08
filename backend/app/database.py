from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 🎯 আপনার সুpabase-এর ফ্রেশ কানেকশন স্ট্রিং
DATABASE_URL = "postgresql://postgres:RayhanMedAssist2026@db.ztocwsgexprijmjjsfct.supabase.co:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()