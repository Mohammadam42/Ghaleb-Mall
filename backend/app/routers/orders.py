from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_admin
from app.models import Order, OrderItem, Product
from app.schemas import OrderCreate, OrderOut, OrderStatusUpdate
from app.services.excel import export_orders
from app.utils import order_number


router = APIRouter(tags=["orders"])

ORDER_STATUSES = {"جديد", "قيد التجهيز", "تم التواصل مع العميل", "تم الإرسال", "تم التسليم", "ملغي"}


@router.post("/orders", response_model=OrderOut)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart cannot be empty")
    order = Order(
        order_number=order_number(),
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_address=payload.customer_address,
        total_amount=0,
        payment_method="cash_on_delivery",
        delivery_note="Delivery within 48 hours",
        status="جديد",
    )
    db.add(order)
    total = 0.0
    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id, Product.is_available.is_(True)).first()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} is unavailable")
        price = product.discount_price or product.price
        subtotal = round(price * item.quantity, 2)
        total += subtotal
        order.items.append(OrderItem(
            product_id=product.id,
            product_name_snapshot=product.name_ar,
            product_price_snapshot=price,
            quantity=item.quantity,
            subtotal=subtotal,
            product_image_snapshot=product.main_image,
        ))
    order.total_amount = round(total, 2)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders/{order_number}", response_model=OrderOut)
def public_order(order_number: str, db: Session = Depends(get_db)):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/admin/orders/export/excel")
def admin_export_orders(_: object = Depends(get_current_admin), db: Session = Depends(get_db)):
    output = export_orders(db)
    headers = {"Content-Disposition": 'attachment; filename="ghaleb-mall-orders.xlsx"'}
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers=headers)


@router.get("/admin/orders", response_model=list[OrderOut])
def admin_orders(
    _: object = Depends(get_current_admin),
    db: Session = Depends(get_db),
    q: str | None = None,
    status: str | None = None,
    limit: int = Query(100, ge=1, le=500),
):
    query = db.query(Order).options(joinedload(Order.items))
    if q:
        query = query.filter(or_(Order.order_number.ilike(f"%{q}%"), Order.customer_name.ilike(f"%{q}%"), Order.customer_phone.ilike(f"%{q}%")))
    if status:
        query = query.filter(Order.status == status)
    return query.order_by(Order.created_at.desc()).limit(limit).all()


@router.get("/admin/orders/{order_id}", response_model=OrderOut)
def admin_order_detail(order_id: int, _: object = Depends(get_current_admin), db: Session = Depends(get_db)):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/admin/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, payload: OrderStatusUpdate, _: object = Depends(get_current_admin), db: Session = Depends(get_db)):
    if payload.status not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid order status")
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@router.put("/admin/orders/{order_id}/cancel", response_model=OrderOut)
def cancel_order(order_id: int, _: object = Depends(get_current_admin), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = "ملغي"
    db.commit()
    db.refresh(order)
    return order

