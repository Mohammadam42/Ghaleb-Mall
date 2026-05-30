from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def now() -> datetime:
    return datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255), default="Ghaleb Mall Admin")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name_ar: Mapped[str] = mapped_column(String(180), index=True)
    name_en: Mapped[str | None] = mapped_column(String(180), nullable=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    banner_image: Mapped[str | None] = mapped_column(String(600), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=now, onupdate=now)

    products: Mapped[list["Product"]] = relationship(back_populates="category", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name_ar: Mapped[str] = mapped_column(String(255), index=True)
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    slug: Mapped[str] = mapped_column(String(280), unique=True, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    price: Mapped[float] = mapped_column(Float)
    discount_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    discount_percentage: Mapped[int] = mapped_column(Integer, default=0)
    description_ar: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    main_image: Mapped[str | None] = mapped_column(String(600), nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_offer: Mapped[bool] = mapped_column(Boolean, default=False)
    stock: Mapped[int] = mapped_column(Integer, default=20)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=now, onupdate=now)

    category: Mapped[Category] = relationship(back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship(back_populates="product", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    image_url: Mapped[str] = mapped_column(String(600))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)

    product: Mapped[Product] = relationship(back_populates="images")


class Discount(Base):
    __tablename__ = "discounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    discount_percentage: Mapped[int] = mapped_column(Integer)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class CustomPage(Base):
    __tablename__ = "custom_pages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title_ar: Mapped[str] = mapped_column(String(255))
    title_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    banner_image: Mapped[str | None] = mapped_column(String(600), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=now, onupdate=now)

    products: Mapped[list["CustomPageProduct"]] = relationship(back_populates="page", cascade="all, delete-orphan")


class CustomPageProduct(Base):
    __tablename__ = "custom_page_products"
    __table_args__ = (UniqueConstraint("custom_page_id", "product_id", name="uq_page_product"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    custom_page_id: Mapped[int] = mapped_column(ForeignKey("custom_pages.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    page: Mapped[CustomPage] = relationship(back_populates="products")
    product: Mapped[Product] = relationship()


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    value: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=now, onupdate=now)


class MediaFile(Base):
    __tablename__ = "media_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    filename: Mapped[str] = mapped_column(String(255))
    original_name: Mapped[str] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(600))
    content_type: Mapped[str] = mapped_column(String(100))
    size: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(255))
    customer_phone: Mapped[str] = mapped_column(String(40), index=True)
    customer_address: Mapped[str] = mapped_column(Text)
    total_amount: Mapped[float] = mapped_column(Float)
    payment_method: Mapped[str] = mapped_column(String(80), default="cash_on_delivery")
    delivery_note: Mapped[str] = mapped_column(String(180), default="Delivery within 48 hours")
    status: Mapped[str] = mapped_column(String(80), default="جديد", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=now, onupdate=now)

    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    product_name_snapshot: Mapped[str] = mapped_column(String(255))
    product_price_snapshot: Mapped[float] = mapped_column(Float)
    quantity: Mapped[int] = mapped_column(Integer)
    subtotal: Mapped[float] = mapped_column(Float)
    product_image_snapshot: Mapped[str | None] = mapped_column(String(600), nullable=True)

    order: Mapped[Order] = relationship(back_populates="items")
    product: Mapped[Product | None] = relationship()

