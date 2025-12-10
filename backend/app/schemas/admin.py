from pydantic import BaseModel
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

    class Config:
        from_attributes = True


class DailySubscriptionCreate(BaseModel):
    user_id: str
    amount: int
    payment_method: PaymentMethod

    class Config:
        from_attributes = True
     
class UserResponse(BaseModel): 
    first_name: str
    last_name: str  
class PaymentResponse(BaseModel):
    user: UserResponse
    amount: int
    payment_date: date
    
