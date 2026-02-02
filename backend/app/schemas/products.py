from uuid import UUID
from pydantic import BaseModel, field_serializer
from datetime import date
from enum import Enum


class PaymentMethod(str, Enum):
    CARD = "card"
    CASH = "cash"


class ProductCreate(BaseModel):
    name: str
    selling_price: int
    purchase_price: int
    total_amount: int
    supplier_name: str | None = None

    class Config:
        from_attributes = True


class ProductUpdate(BaseModel):
    name: str | None = None
    selling_price: int | None = None
    purchase_price: int | None = None
    total_amount: int | None = None
    current_amount: int | None = None
    supplier_name: str | None = None

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: UUID
    name: str
    image_path: str | None = None
    selling_price: int
    purchase_price: int
    total_amount: int
    current_amount: int
    supplier_name: str | None = None
    created_at: date

    @field_serializer("id")
    def serialize_id(self, id: UUID) -> str:
        return str(id)

    class Config:
        from_attributes = True


class ProductSellRequest(BaseModel):
    product_id: str
    quantity: int
    payment_method: PaymentMethod

    class Config:
        from_attributes = True


class ProductSaleResponse(BaseModel):
    id: UUID
    quantity: int
    total_price: int
    sale_date: date
    payment_method: str
    product_name: str

    @field_serializer("id")
    def serialize_id(self, id: UUID) -> str:
        return str(id)

    class Config:
        from_attributes = True


class MarketplaceStatusResponse(BaseModel):
    marketplace_enabled: bool

    class Config:
        from_attributes = True
