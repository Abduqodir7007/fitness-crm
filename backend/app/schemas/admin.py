from pydantic import BaseModel
from enum import Enum


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

    class Config:
        from_attributes = True


class DailySubscriptionCreate(BaseModel):
    user_id: str
    amount: int
    payment_method: PaymentMethod

    class Config:
        from_attributes = True
