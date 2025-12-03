from pydantic import BaseModel
from enum import Enum
from datetime import date

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
    date_of_birth: date 
    is_superuser: bool | None = False
    gender: Gender | None = Gender.MALE
    role: UserRole | None = UserRole.CLIENT

class UserLogin(BaseModel):
    phone_number: str
    password: str