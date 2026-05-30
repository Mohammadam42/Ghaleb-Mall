import re
from datetime import datetime


ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def slugify(value: str, fallback: str = "item") -> str:
    value = (value or fallback).strip().lower()
    value = value.translate(ARABIC_DIGITS)
    value = re.sub(r"[^\w\u0600-\u06FF]+", "-", value, flags=re.UNICODE)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or fallback


def unique_slug(db, model, base: str, current_id: int | None = None) -> str:
    candidate = slugify(base)
    slug = candidate
    index = 2
    while True:
        query = db.query(model).filter(model.slug == slug)
        if current_id is not None:
            query = query.filter(model.id != current_id)
        if not query.first():
            return slug
        slug = f"{candidate}-{index}"
        index += 1


def calculate_discount(price: float, discount_price: float | None) -> int:
    if not price or not discount_price or discount_price >= price:
        return 0
    return max(0, round(((price - discount_price) / price) * 100))


def order_number(order_id_hint: int | None = None) -> str:
    stamp = datetime.utcnow().strftime("%y%m%d%H%M%S")
    suffix = f"{order_id_hint:04d}" if order_id_hint else "0000"
    return f"GM-{stamp}-{suffix}"

