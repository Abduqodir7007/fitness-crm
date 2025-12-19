from pydantic import BaseModel, field_serializer, field_validator
from enum import Enum
from datetime import date
from uuid import UUID


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class UserRole(str, Enum):
    CLIENT = "client"
    TRAINER = "trainer"
    ADMIN = "admin"


class Status(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    password: str
    date_of_birth: date | None = None
    gender: Gender | None = Gender.MALE
    role: UserRole | None = UserRole.CLIENT


class UserLogin(BaseModel):
    phone_number: str
    password: str


class SubscriptionPlansResponse(BaseModel):
    type: str
    price: int
    duration_days: int
    is_active: bool


    class Config:
        from_attributes = True


class SubscriptionResponse(BaseModel):
    start_date: date
    end_date: date
    plan: SubscriptionPlansResponse

    @field_serializer("start_date", "end_date")
    def serialize_date(self, date_field: date) -> str:
        return date_field.isoformat()

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    date_of_birth: date | None = None
    gender: Gender | None = None
    role: UserRole | None = None
    is_active: bool | None = True
    subscriptions: list[SubscriptionResponse] = []


class UserListResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    phone_number: str
    date_of_birth: date | None = None
    gender: Gender | None = None
    role: UserRole | None = None
    is_active: bool | None = True

    @field_validator("gender", mode="before")
    @classmethod
    def normalize_gender(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_serializer("id")
    def serialize_id(self, id: UUID) -> str:
        return str(id)

    @field_serializer("date_of_birth")
    def serialize_date(self, date_of_birth: date | None) -> str | None:
        return date_of_birth.isoformat() if date_of_birth else None

    class Config:
        from_attributes = True