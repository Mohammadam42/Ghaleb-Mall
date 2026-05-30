from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_admin
from app.models import Category, CustomPage, CustomPageProduct, Discount, MediaFile, Order, Product, ProductImage, SiteSettings
from app.schemas import CategoryCreate, CategoryOut, CustomPageCreate, CustomPageOut, ImportPreview, LogoState, MediaFileOut, ProductCreate, ProductOut, StatsOut
from app.services.excel import create_product_template, export_products, import_products
from app.services.media import delete_media_url, save_upload
from app.utils import calculate_discount, unique_slug


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


def set_setting(db: Session, key: str, value: str | None) -> None:
    setting = db.query(SiteSettings).filter(SiteSettings.key == key).first()
    if not setting:
        setting = SiteSettings(key=key, value=value)
        db.add(setting)
    else:
        setting.value = value


@router.get("/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db)):
    total_sales = sum(order.total_amount for order in db.query(Order).filter(Order.status != "ملغي").all())
    return StatsOut(
        total_products=db.query(Product).count(),
        total_categories=db.query(Category).count(),
        discounted_products=db.query(Product).filter(Product.is_offer.is_(True)).count(),
        featured_products=db.query(Product).filter(Product.is_featured.is_(True)).count(),
        custom_pages=db.query(CustomPage).count(),
        new_orders=db.query(Order).filter(Order.status == "جديد").count(),
        total_orders=db.query(Order).count(),
        total_sales=round(total_sales, 2),
        processing_orders=db.query(Order).filter(Order.status == "قيد التجهيز").count(),
    )


@router.post("/categories", response_model=CategoryOut)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    category = Category(**payload.model_dump(), slug=unique_slug(db, Category, payload.name_ar))
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, payload: CategoryCreate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in payload.model_dump().items():
        setattr(category, key, value)
    category.slug = unique_slug(db, Category, payload.name_ar, current_id=category.id)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"ok": True}


@router.post("/products", response_model=ProductOut)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    discount_percentage = payload.discount_percentage or calculate_discount(payload.price, payload.discount_price)
    product = Product(
        name_ar=payload.name_ar,
        name_en=payload.name_en,
        slug=unique_slug(db, Product, payload.name_ar),
        category_id=payload.category_id,
        price=payload.price,
        discount_price=payload.discount_price,
        discount_percentage=discount_percentage,
        description_ar=payload.description_ar,
        description_en=payload.description_en,
        main_image=payload.main_image or (payload.images[0] if payload.images else None),
        is_available=payload.is_available,
        is_featured=payload.is_featured,
        is_offer=payload.is_offer or bool(payload.discount_price),
        stock=payload.stock,
    )
    db.add(product)
    db.flush()
    for index, image in enumerate(payload.images or ([product.main_image] if product.main_image else [])):
        if image:
            product.images.append(ProductImage(image_url=image, sort_order=index, alt_text=product.name_ar))
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductCreate, db: Session = Depends(get_db)):
    product = db.query(Product).options(joinedload(Product.images)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not db.query(Category).filter(Category.id == payload.category_id).first():
        raise HTTPException(status_code=404, detail="Category not found")
    product.name_ar = payload.name_ar
    product.name_en = payload.name_en
    product.slug = unique_slug(db, Product, payload.name_ar, current_id=product.id)
    product.category_id = payload.category_id
    product.price = payload.price
    product.discount_price = payload.discount_price
    product.discount_percentage = payload.discount_percentage or calculate_discount(payload.price, payload.discount_price)
    product.description_ar = payload.description_ar
    product.description_en = payload.description_en
    product.main_image = payload.main_image or (payload.images[0] if payload.images else None)
    product.is_available = payload.is_available
    product.is_featured = payload.is_featured
    product.is_offer = payload.is_offer or bool(payload.discount_price)
    product.stock = payload.stock
    product.images.clear()
    for index, image in enumerate(payload.images or ([product.main_image] if product.main_image else [])):
        if image:
            product.images.append(ProductImage(image_url=image, sort_order=index, alt_text=product.name_ar))
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"ok": True}


@router.post("/discounts/product")
def discount_product(product_id: int = Form(...), percentage: int = Form(...), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.discount_percentage = percentage
    product.discount_price = round(product.price * (1 - percentage / 100), 2)
    product.is_offer = True
    discount = Discount(title=f"Discount on {product.name_ar}", product_id=product.id, discount_percentage=percentage)
    db.add(discount)
    db.commit()
    return {"ok": True, "discount_id": discount.id}


@router.post("/discounts/category")
def discount_category(category_id: int = Form(...), percentage: int = Form(...), db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    for product in category.products:
        product.discount_percentage = percentage
        product.discount_price = round(product.price * (1 - percentage / 100), 2)
        product.is_offer = True
    discount = Discount(title=f"Discount on {category.name_ar}", category_id=category.id, discount_percentage=percentage)
    db.add(discount)
    db.commit()
    return {"ok": True, "discount_id": discount.id}


@router.delete("/discounts/{discount_id}")
def delete_discount(discount_id: int, db: Session = Depends(get_db)):
    discount = db.query(Discount).filter(Discount.id == discount_id).first()
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")
    if discount.product_id:
        product = db.query(Product).filter(Product.id == discount.product_id).first()
        if product:
            product.discount_price = None
            product.discount_percentage = 0
            product.is_offer = False
    if discount.category_id:
        products = db.query(Product).filter(Product.category_id == discount.category_id).all()
        for product in products:
            product.discount_price = None
            product.discount_percentage = 0
            product.is_offer = False
    db.delete(discount)
    db.commit()
    return {"ok": True}


@router.post("/pages", response_model=CustomPageOut)
def create_page(payload: CustomPageCreate, db: Session = Depends(get_db)):
    page = CustomPage(
        title_ar=payload.title_ar,
        title_en=payload.title_en,
        slug=unique_slug(db, CustomPage, payload.title_ar),
        description=payload.description,
        banner_image=payload.banner_image,
        is_published=payload.is_published,
    )
    db.add(page)
    db.flush()
    for index, product_id in enumerate(payload.product_ids):
        if db.query(Product).filter(Product.id == product_id).first():
            page.products.append(CustomPageProduct(product_id=product_id, sort_order=index))
    db.commit()
    db.refresh(page)
    return page_response(page)


@router.put("/pages/{page_id}", response_model=CustomPageOut)
def update_page(page_id: int, payload: CustomPageCreate, db: Session = Depends(get_db)):
    page = db.query(CustomPage).filter(CustomPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    page.title_ar = payload.title_ar
    page.title_en = payload.title_en
    page.slug = unique_slug(db, CustomPage, payload.title_ar, current_id=page.id)
    page.description = payload.description
    page.banner_image = payload.banner_image
    page.is_published = payload.is_published
    page.products.clear()
    for index, product_id in enumerate(payload.product_ids):
        if db.query(Product).filter(Product.id == product_id).first():
            page.products.append(CustomPageProduct(product_id=product_id, sort_order=index))
    db.commit()
    db.refresh(page)
    return page_response(page)


@router.delete("/pages/{page_id}")
def delete_page(page_id: int, db: Session = Depends(get_db)):
    page = db.query(CustomPage).filter(CustomPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    db.delete(page)
    db.commit()
    return {"ok": True}


@router.post("/pages/{page_id}/products")
def add_page_products(page_id: int, product_ids: list[int], db: Session = Depends(get_db)):
    page = db.query(CustomPage).filter(CustomPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    existing = {item.product_id for item in page.products}
    start = len(existing)
    for offset, product_id in enumerate(product_ids):
        if product_id not in existing and db.query(Product).filter(Product.id == product_id).first():
            page.products.append(CustomPageProduct(product_id=product_id, sort_order=start + offset))
    db.commit()
    return {"ok": True}


@router.put("/pages/{page_id}/products/reorder")
def reorder_page_products(page_id: int, product_ids: list[int], db: Session = Depends(get_db)):
    page = db.query(CustomPage).filter(CustomPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    order_map = {product_id: index for index, product_id in enumerate(product_ids)}
    for item in page.products:
        item.sort_order = order_map.get(item.product_id, item.sort_order)
    db.commit()
    return {"ok": True}


def page_response(page: CustomPage) -> dict:
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
        "products": [item.product for item in sorted(page.products, key=lambda item: item.sort_order) if item.product],
    }


@router.get("/media", response_model=list[MediaFileOut])
def list_media(db: Session = Depends(get_db)):
    return db.query(MediaFile).order_by(MediaFile.created_at.desc()).all()


@router.post("/media/upload", response_model=MediaFileOut)
def upload_media(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename, url, size = save_upload(file, folder="uploads")
    media = MediaFile(filename=filename, original_name=file.filename or filename, url=url, content_type=file.content_type or "application/octet-stream", size=size)
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


@router.delete("/media/{media_id}")
def delete_media(media_id: int, db: Session = Depends(get_db)):
    media = db.query(MediaFile).filter(MediaFile.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media file not found")
    delete_media_url(media.url)
    db.delete(media)
    db.commit()
    return {"ok": True}


@router.post("/logo/upload", response_model=LogoState)
def upload_logo(file: UploadFile = File(...), db: Session = Depends(get_db)):
    _, url, _ = save_upload(file, folder="logo")
    set_setting(db, "pending_logo_url", url)
    db.commit()
    return logo_preview(db)


@router.get("/logo/preview", response_model=LogoState)
def logo_preview(db: Session = Depends(get_db)):
    values = {setting.key: setting.value for setting in db.query(SiteSettings).all()}
    return LogoState(
        pending_logo_url=values.get("pending_logo_url"),
        confirmed_logo_url=values.get("confirmed_logo_url") or "/static/ghaleb-logo-transparent.png",
    )


@router.post("/logo/confirm", response_model=LogoState)
def confirm_logo(db: Session = Depends(get_db)):
    values = {setting.key: setting.value for setting in db.query(SiteSettings).all()}
    pending = values.get("pending_logo_url")
    if not pending:
        raise HTTPException(status_code=400, detail="Upload a logo before confirming")
    set_setting(db, "confirmed_logo_url", pending)
    set_setting(db, "pending_logo_url", None)
    db.commit()
    return logo_preview(db)


@router.post("/import/products/excel", response_model=ImportPreview)
def import_products_excel(file: UploadFile = File(...), commit: bool = Form(False), db: Session = Depends(get_db)):
    result = import_products(db, file, commit=commit)
    return ImportPreview(**result)


@router.get("/export/products/excel")
def export_products_excel(db: Session = Depends(get_db)):
    output = export_products(db)
    headers = {"Content-Disposition": 'attachment; filename="ghaleb-mall-products.xlsx"'}
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers=headers)


@router.get("/excel/template")
def excel_template():
    output = create_product_template()
    headers = {"Content-Disposition": 'attachment; filename="ghaleb-mall-products-template.xlsx"'}
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers=headers)
