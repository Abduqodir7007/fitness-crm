from pydantic import BaseModel
from enum import Enum


class PaymentMethod(str, Enum):
    CREDIT_CARD = "card"
    CASH = "cash"


class SubscriptionPlanCreate(BaseModel):
    name: str
    price: int
    duration_days: int


class SubscriptionCreate(BaseModel):
    user_id: str
    plan_id: str
    payment_method: PaymentMethod
