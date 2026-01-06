from pydantic import (
    BaseModel,
    field_serializer,
    field_validator,
    model_validator,
)
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


class Token(BaseModel):
    access_token: str
    refresh_token: str
    is_superuser: bool
    role: str
    token_type: str


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    password: str
    date_of_birth: date | None = None
    gender: Gender | None = Gender.MALE
    role: UserRole | None = UserRole.CLIENT

    @field_validator("password")
    def validate_pwd(cls, password: str) -> str:
        if len(password) < 6 or len(password) > 60:
            raise ValueError("Password must be between 6 and 60 characters")
        return password

    @model_validator(mode="before")
    def validate_names(cls, values: dict):
        first = values.get("first_name", "")
        last = values.get("last_name", "")

        if len(first) < 2 or len(last) < 2:
            raise ValueError("First name and last name must be at least 2 characters")

        values["first_name"] = values["first_name"].strip().capitalize()
        values["last_name"] = values["last_name"].strip().capitalize()

        return values


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


class UpdateUserPassword(BaseModel):
    user_id: UUID
    password: str
    confirm_password: str

    @field_validator("password", "confirm_password")
    @classmethod
    def validate_password(cls, password: str):
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long.")

    @model_validator(mode="after")
    def password_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self

    @field_serializer("user_id")
    def serialize_id(cls, id: UUID) -> str:
        return str(id)


class UpdateUserInformation(BaseModel):
    user_id: UUID
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None

    @field_serializer("user_id")
    def serialize_id(cls, id: UUID) -> str:
        return str(id)
