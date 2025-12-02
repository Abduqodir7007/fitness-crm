from pydantic import BaseModel


class SubscriptionPlanCreate(BaseModel):
    name: str
    price: int
    duration_days: int
    
    
    