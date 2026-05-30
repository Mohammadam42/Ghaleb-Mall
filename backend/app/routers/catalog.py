from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Category, CustomPage, Product, SiteSettings
from app.schemas import CategoryOut, CustomPageOut, LogoState, ProductListResponse, ProductOut


router = APIRouter(tags=["public"])


@router.get("/settings/logo", response_model=LogoState)
def logo_state(db: Session = Depends(get_db)):
    values = {setting.key: setting.value for setting in db.query(SiteSettings).all()}
    return LogoState(
        pending_logo_url=values.get("pending_logo_url"),
        confirmed_logo_url=values.get("confirmed_logo_url") or "/static/ghaleb-logo-transparent.png",
    )


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.is_active.is_(True)).order_by(Category.sort_order, Category.id).all()


@router.get("/products", response_model=ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    q: str | None = None,
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    offers: bool | None = None,
    featured: bool | None = None,
    sort: str = Query("newest", pattern="^(newest|price_asc|price_desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
):
    query = db.query(Product).options(joinedload(Product.category), joinedload(Product.images))
    if q:
        query = query.filter(or_(Product.name_ar.ilike(f"%{q}%"), Product.name_en.ilike(f"%{q}%"), Product.description_ar.ilike(f"%{q}%")))
    if category:
        query = query.join(Category).filter(or_(Category.slug == category, Category.name_ar == category, Category.name_en == category))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if offers is not None:
        query = query.filter(Product.is_offer.is_(offers))
    if featured is not None:
        query = query.filter(Product.is_featured.is_(featured))
    total = query.count()
    if sort == "price_asc":
        query = query.order_by(Product.discount_price.asc().nulls_last(), Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.discount_price.desc().nulls_last(), Product.price.desc())
    else:
        query = query.order_by(Product.created_at.desc())
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return ProductListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/products/{identifier}", response_model=ProductOut)
def product_detail(identifier: str, db: Session = Depends(get_db)):
    query = db.query(Product).options(joinedload(Product.category), joinedload(Product.images))
    product = query.filter(Product.id == int(identifier)).first() if identifier.isdigit() else query.filter(Product.slug == identifier).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/pages")
def list_pages(db: Session = Depends(get_db)):
    pages = db.query(CustomPage).filter(CustomPage.is_published.is_(True)).order_by(CustomPage.created_at.desc()).all()
    return [{"id": page.id, "title_ar": page.title_ar, "title_en": page.title_en, "slug": page.slug, "description": page.description, "banner_image": page.banner_image, "is_published": page.is_published} for page in pages]


@router.get("/pages/{slug}", response_model=CustomPageOut)
def page_detail(slug: str, db: Session = Depends(get_db)):
    page = db.query(CustomPage).filter(CustomPage.slug == slug, CustomPage.is_published.is_(True)).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    products = [item.product for item in sorted(page.products, key=lambda item: item.sort_order) if item.product]
    return {
        "id": page.id,
        "title_ar": page.title_ar,
        "title_en": page.title_en,
        "slug": page.slug,
        "description": page.description,
        "banner_image": page.banner_image,
        "is_published": page.is_published,
        "created_at": page.created_at,
        "updated_at": page.updated_at,
        "products": products,
    }
