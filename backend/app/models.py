from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, JSON
from app.database import Base

class UserDB(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PredictionDB(Base):
    __tablename__ = "health_risk_predictions"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    prediction_type = Column(String, nullable=False)
    input_features = Column(JSON, nullable=False)
    risk_probability = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)