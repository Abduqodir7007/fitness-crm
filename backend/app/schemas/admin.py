from uuid import UUID
from pydantic import BaseModel, field_serializer
from enum import Enum
from datetime import date


class PaymentMethod(str, Enum):
    CREDIT_CARD = "card"
    CASH = "cash"


class SubscriptionPlanCreate(BaseModel):
    name: str
    price: int
    duration_days: int

    class Config:
        from_attributes = True


class SubscriptionCreate(BaseModel):
    user_id: str
    plan_id: str
    payment_method: PaymentMethod
    trainer_id: str | None = None

    class Config:
        from_attributes = True


class SubscriptionResponse(BaseModel):
    id: UUID
    type: str
    price: int
    duration_days: int
    is_active: bool

    class Config:
        from_attributes = True


class DailySubscriptionCreate(BaseModel):
    user_id: str
    amount: int
    payment_method: PaymentMethod

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    phone_number: str

    @field_serializer("id")
    def serialize_id(self, id: UUID) -> str:
        return str(id)


class PaymentResponse(BaseModel):
    user: UserResponse
    amount: int
    payment_date: date


class AttendanceResponse(BaseModel):
    user: UserResponse
    date: date
