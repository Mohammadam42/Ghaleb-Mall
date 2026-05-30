from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str

    model_config = {"from_attributes": True}


class ProductImageOut(BaseModel):
    id: int
    image_url: str
    sort_order: int = 0
    alt_text: str | None = None

    model_config = {"from_attributes": True}


class CategoryBase(BaseModel):
    name_ar: str
    name_en: str | None = None
    description: str | None = None
    banner_image: str | None = None
    sort_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductBase(BaseModel):
    name_ar: str
    name_en: str | None = None
    category_id: int
    price: float = Field(gt=0)
    discount_price: float | None = None
    discount_percentage: int = 0
    description_ar: str | None = None
    description_en: str | None = None
    main_image: str | None = None
    images: list[str] = []
    is_available: bool = True
    is_featured: bool = False
    is_offer: bool = False
    stock: int = 20


class ProductCreate(ProductBase):
    @field_validator("discount_price")
    @classmethod
    def valid_discount(cls, value: float | None, info):
        price = info.data.get("price")
        if value is not None and price and value >= price:
            raise ValueError("discount_price must be less than price")
        return value


class ProductOut(BaseModel):
    id: int
    name_ar: str
    name_en: str | None
    slug: str
    category_id: int
    category: CategoryOut | None = None
    price: float
    discount_price: float | None
    discount_percentage: int
    description_ar: str | None
    description_en: str | None
    main_image: str | None
    is_available: bool
    is_featured: bool
    is_offer: bool
    stock: int
    images: list[ProductImageOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: list[ProductOut]
    total: int
    page: int
    page_size: int


class CustomPageBase(BaseModel):
    title_ar: str
    title_en: str | None = None
    description: str | None = None
    banner_image: str | None = None
    is_published: bool = True


class CustomPageCreate(CustomPageBase):
    product_ids: list[int] = []


class CustomPageOut(CustomPageBase):
    id: int
    slug: str
    products: list[ProductOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MediaFileOut(BaseModel):
    id: int
    filename: str
    original_name: str
    url: str
    content_type: str
    size: int
    created_at: datetime

    model_config = {"from_attributes": True}


class LogoState(BaseModel):
    pending_logo_url: str | None = None
    confirmed_logo_url: str | None = None
    fallback_text: str = "غالب مول | Ghaleb Mall"


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=99)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2)
    customer_phone: str = Field(min_length=7)
    customer_address: str = Field(min_length=5)
    items: list[OrderItemCreate]

    @field_validator("customer_phone")
    @classmethod
    def validate_jordan_phone(cls, value: str) -> str:
        clean = value.replace(" ", "").replace("-", "")
        ok = (
            clean.startswith(("077", "078", "079")) and len(clean) == 10
        ) or (
            clean.startswith(("+96277", "+96278", "+96279")) and len(clean) == 13
        ) or (
            clean.startswith(("0096277", "0096278", "0096279")) and len(clean) == 14
        )
        if not ok:
            raise ValueError("Phone number must be a valid Jordanian mobile number")
        return value


class OrderItemOut(BaseModel):
    id: int
    product_id: int | None
    product_name_snapshot: str
    product_price_snapshot: float
    quantity: int
    subtotal: float
    product_image_snapshot: str | None = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_phone: str
    customer_address: str
    total_amount: float
    payment_method: str
    delivery_note: str
    status: str
    items: list[OrderItemOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str


class StatsOut(BaseModel):
    total_products: int
    total_categories: int
    discounted_products: int
    featured_products: int
    custom_pages: int
    new_orders: int
    total_orders: int
    total_sales: float
    processing_orders: int


class ImportPreview(BaseModel):
    ok: bool
    created: int = 0
    updated: int = 0
    rows: list[dict[str, Any]] = []
    errors: list[str] = []

