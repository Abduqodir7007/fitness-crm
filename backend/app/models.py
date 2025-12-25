import uuid
from sqlalchemy import Column, String, Boolean, Date, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, date

from .database import Base


class Users(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone_number = Column(String(20), unique=True, nullable=False)
    role = Column(String(20), nullable=True, default="client")
    gender = Column(String(10), nullable=True, default="male")
    hashed_password = Column(String, nullable=False)

    created_at = Column(Date, default=datetime.utcnow())
    date_of_birth = Column(Date, nullable=False)

    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    subscriptions = relationship(
        "Subscriptions",
        back_populates="user",
        foreign_keys="Subscriptions.user_id",
        cascade="all, delete-orphan",
    )

    attendances = relationship("Attendance", back_populates="user")
    daily_subscriptions = relationship("DailySubscriptions", back_populates="user")
    payments = relationship("Payment", back_populates="user")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class SubscriptionPlans(Base):
    __tablename__ = "subscription_plan"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(50), nullable=False)

    price = Column(Integer, nullable=False)
    duration_days = Column(Integer, nullable=False)

    is_active = Column(Boolean, default=True)

    subscriptions = relationship(
        "Subscriptions", back_populates="plan", cascade="all, delete-orphan"
    )


class Subscriptions(Base):
    __tablename__ = "subscription"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    payment_method = Column(String(50), nullable=False)
    end_date = Column(Date, nullable=False)
    start_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)

    trainer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    trainer = relationship("Users", foreign_keys=[trainer_id])

    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user = relationship("Users", foreign_keys=[user_id], back_populates="subscriptions")

    plan_id = Column(
        UUID(as_uuid=True),
        ForeignKey("subscription_plan.id", ondelete="CASCADE"),
        nullable=False,
    )
    plan = relationship("SubscriptionPlans", back_populates="subscriptions")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    date = Column(Date, default=date.today(), nullable=False)

    user = relationship("Users", back_populates="attendances")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    amount = Column(Integer, nullable=False)
    payment_date = Column(Date, default=date.today(), nullable=False)
    payment_method = Column(String(50), nullable=False)

    user = relationship("Users", back_populates="payments")


class DailySubscriptions(Base):
    __tablename__ = "daily_subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subscription_date = Column(Date, default=date.today(), nullable=False)
    amount = Column(Integer, nullable=False)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user = relationship("Users", back_populates="daily_subscriptions")
