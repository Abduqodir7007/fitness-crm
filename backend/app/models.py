import uuid
from sqlalchemy import Column, String, Boolean, Date, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime


class Users(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone_number = Column(String(20), unique=True, nullable=False)
    role = Column(String(20), nullable=False, default="client")
    gender = Column(String(10), nullable=False)
    hashed_password = Column(String, nullable=False)

    created_at = Column(Date, nullable=False, default=datetime.utcnow())
    date_of_birth = Column(Date, nullable=False)

    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    subscriptions = relationship("Subscriptions", back_populates="user")
    


class SubscriptionPlans(Base):
    __tablename__ = "subscription_plan"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False)
    
    price = Column(Integer, nullable=False)
    duration_days = Column(Integer, nullable=False)
    
    is_active = Column(Boolean, default=True)

    subscriptions = relationship("Subscriptions", back_populates="plan")


class Subscriptions(Base):
    __tablename__ = "subscription"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan_id = Column(
        UUID(as_uuid=True), ForeignKey("subscription_plan.id"), nullable=False
    )
    
    end_date = Column(Date, nullable=False)
    start_date = Column(Date, nullable=False)
    
    is_active = Column(Boolean, default=True)
    
    status = Column(String(15), nullable=False)

    user = relationship("Users", back_populates="subscriptions")
    plan = relationship("SubscriptionPlans", back_populates="subscriptions")
