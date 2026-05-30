from sqlalchemy.orm import Session

from app.auth import ensure_admin_user
from app.models import Category, CustomPage, CustomPageProduct, Order, OrderItem, Product, ProductImage, SiteSettings
from app.utils import calculate_discount, order_number, unique_slug


CATEGORIES = [
    ("رجالي", "Men", "menswear,casual outfit"),
    ("ستاتي", "Women", "women fashion,boutique"),
    ("ولادي", "Boys", "boys clothing,kids fashion"),
    ("بناتي", "Girls", "girls clothing,kids fashion"),
    ("أحذية ولادي", "Boys Shoes", "boys sneakers,shoes"),
    ("أحذية ستاتي", "Women Shoes", "women shoes,heels"),
    ("فساتين", "Dresses", "evening dress,fashion"),
    ("أخرى", "Other", "fashion accessories,retail"),
]

IMAGE_POOL = {
    "رجالي": [
        "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    ],
    "ستاتي": [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80",
    ],
    "ولادي": [
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80",
    ],
    "بناتي": [
        "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    ],
    "أحذية ولادي": [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80",
    ],
    "أحذية ستاتي": [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=900&q=80",
    ],
    "فساتين": [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&w=900&q=80",
    ],
    "أخرى": [
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80",
    ],
}

PRODUCT_NAMES = {
    "رجالي": ["طقم رجالي كاجوال", "بنطلون رجالي كلاسيك", "بلوزة صوف رجالي", "جاكيت رجالي شتوي", "قميص رجالي رسمي", "تيشيرت رجالي يومي", "كنزة رجالي Old Money", "بدلة رجالي خفيفة", "هودي رجالي شبابي", "شورت رجالي صيفي"],
    "ستاتي": ["بلوزة ستاتي ناعمة", "عباءة ستاتي أنيقة", "جاكيت ستاتي قصير", "بنطلون ستاتي واسع", "طقم ستاتي عملي", "قميص ستاتي فاخر", "تنورة ستاتي كلاسيك", "كارديغان ستاتي", "بلوزة Old Money", "تونيك ستاتي مريح"],
    "ولادي": ["طقم ولادي رياضي", "جاكيت ولادي مبطن", "بنطلون ولادي جينز", "بلوزة ولادي قطن", "هودي ولادي", "قميص ولادي مناسبات", "طقم أطفال ولادي", "شورت ولادي", "كنزة ولادي شتوية", "بيجاما ولادي"],
    "بناتي": ["جاكيت بناتي", "طقم بناتي ملون", "فستان بناتي يومي", "تنورة بناتي", "بلوزة بناتي", "هودي بناتي", "بنطلون بناتي", "طقم أطفال بناتي", "كارديغان بناتي", "بيجاما بناتي"],
    "أحذية ولادي": ["حذاء ولادي رياضي", "سنيكرز ولادي خفيف", "بوت ولادي شتوي", "حذاء مدرسة ولادي", "صندل ولادي", "حذاء ولادي كاجوال", "حذاء كرة ولادي", "سليبر ولادي", "حذاء جلد ولادي", "حذاء مشي ولادي"],
    "أحذية ستاتي": ["حذاء ستاتي أنيق", "كعب ستاتي سهرة", "سنيكرز ستاتي", "بوت ستاتي", "صندل ستاتي", "حذاء عمل ستاتي", "حذاء مسطح ستاتي", "حذاء جلد ستاتي", "كعب مريح ستاتي", "حذاء مناسبات ستاتي"],
    "فساتين": ["فستان سهرة فاخر", "فستان ناعم للمناسبات", "فستان خطوبة أنيق", "فستان سهرة مطرز", "فستان قصير راقي", "فستان طويل كلاسيك", "فستان ساتان", "فستان مخمل", "فستان عائلي راقي", "فستان سهرة محتشم"],
    "أخرى": ["حقيبة ستاتي", "إكسسوار شعر", "حزام رجالي", "نظارة شمسية", "محفظة جلد", "وشاح أنيق", "طقم إكسسوارات", "قبعة شبابية", "ربطة عنق", "جوارب قطنية"],
}


def seed_database(db: Session) -> dict[str, int]:
    ensure_admin_user(db)
    created_categories = 0
    created_products = 0
    created_pages = 0
    created_orders = 0

    for sort_order, (name_ar, name_en, image_query) in enumerate(CATEGORIES, start=1):
        category = db.query(Category).filter(Category.name_ar == name_ar).first()
        if not category:
            category = Category(
                name_ar=name_ar,
                name_en=name_en,
                slug=unique_slug(db, Category, name_ar),
                description=f"تشكيلة {name_ar} المختارة بعناية من غالب مول في عمان.",
                banner_image=IMAGE_POOL[name_ar][0],
                sort_order=sort_order,
                is_active=True,
            )
            db.add(category)
            db.flush()
            created_categories += 1
        for index, product_name in enumerate(PRODUCT_NAMES[name_ar], start=1):
            if db.query(Product).filter(Product.name_ar == product_name).first():
                continue
            price = round(5.0 + sort_order * 1.75 + index * 1.15, 2)
            has_discount = index in {2, 4, 7}
            discount_price = round(price * 0.82, 2) if has_discount else None
            images = IMAGE_POOL[name_ar]
            product = Product(
                name_ar=product_name,
                name_en=f"{name_en} item {index}",
                slug=unique_slug(db, Product, product_name),
                category_id=category.id,
                price=price,
                discount_price=discount_price,
                discount_percentage=calculate_discount(price, discount_price),
                description_ar=f"{product_name} من غالب مول بخامة عملية وموديل مناسب للتسوق اليومي والمناسبات. متوفر بتشكيلة ألوان ومقاسات.",
                description_en=f"Selected {name_en.lower()} item from Ghaleb Mall with practical fabric and modern styling.",
                main_image=images[index % len(images)],
                is_available=True,
                is_featured=index in {1, 3, 6},
                is_offer=has_discount,
                stock=12 + index,
            )
            db.add(product)
            db.flush()
            for image_index, image_url in enumerate(images):
                product.images.append(ProductImage(image_url=image_url, sort_order=image_index, alt_text=product.name_ar))
            created_products += 1

    pages = [
        ("عروض اليوم", "Today Offers", "خصومات يومية مختارة على الملابس والأحذية.", lambda p: p.is_offer),
        ("فساتين سهرة", "Evening Dresses", "فساتين سهرة ومناسبات بتصاميم راقية.", lambda p: p.category and p.category.name_ar == "فساتين"),
        ("تصفية الموسم", "Season Clearance", "قطع مختارة بأسعار مناسبة قبل نهاية الموسم.", lambda p: p.discount_percentage >= 15 or p.category.name_ar in {"رجالي", "ستاتي"}),
    ]
    for title_ar, title_en, description, predicate in pages:
        page = db.query(CustomPage).filter(CustomPage.title_ar == title_ar).first()
        if page:
            continue
        page = CustomPage(
            title_ar=title_ar,
            title_en=title_en,
            slug=unique_slug(db, CustomPage, title_ar),
            description=description,
            banner_image="/static/ghaleb-logo-transparent.png",
            is_published=True,
        )
        db.add(page)
        db.flush()
        selected = [product for product in db.query(Product).options().all() if predicate(product)][:16]
        for index, product in enumerate(selected):
            page.products.append(CustomPageProduct(product_id=product.id, sort_order=index))
        created_pages += 1

    set_logo_defaults(db)
    if db.query(Order).count() == 0:
        products = db.query(Product).limit(6).all()
        demo_customers = [
            ("سارة أحمد", "0798881300", "عمان - راس العين - قرب سامح مول"),
            ("محمد خالد", "0781234567", "عمان - جبل الحسين"),
            ("ليان محمود", "0771234567", "عمان - الوحدات"),
        ]
        for index, customer in enumerate(demo_customers):
            order = Order(order_number=order_number(index + 1), customer_name=customer[0], customer_phone=customer[1], customer_address=customer[2], total_amount=0, status="جديد" if index == 0 else "قيد التجهيز")
            db.add(order)
            total = 0.0
            for product in products[index * 2:index * 2 + 2]:
                price = product.discount_price or product.price
                subtotal = round(price * (index + 1), 2)
                total += subtotal
                order.items.append(OrderItem(product_id=product.id, product_name_snapshot=product.name_ar, product_price_snapshot=price, quantity=index + 1, subtotal=subtotal, product_image_snapshot=product.main_image))
            order.total_amount = round(total, 2)
            created_orders += 1

    db.commit()
    return {
        "categories": created_categories,
        "products": created_products,
        "pages": created_pages,
        "orders": created_orders,
    }


def set_logo_defaults(db: Session) -> None:
    confirmed = db.query(SiteSettings).filter(SiteSettings.key == "confirmed_logo_url").first()
    if not confirmed:
        db.add(SiteSettings(key="confirmed_logo_url", value="/static/ghaleb-logo-transparent.png"))
    elif confirmed.value == "/static/ghaleb-logo.jpg":
        confirmed.value = "/static/ghaleb-logo-transparent.png"
