import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from app.config import get_settings  # noqa: E402
from app.database import init_db  # noqa: E402
from app.main import app  # noqa: E402
from app.seed_data import seed_database  # noqa: E402
from app.database import SessionLocal  # noqa: E402


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    client = TestClient(app)
    health = client.get("/health")
    assert health.status_code == 200, health.text
    categories = client.get("/categories")
    assert categories.status_code == 200, categories.text
    products = client.get("/products?page_size=3")
    assert products.status_code == 200, products.text
    product_items = products.json()["items"]
    assert product_items, "Smoke test needs at least one seeded product"
    logo = client.get("/settings/logo")
    assert logo.status_code == 200, logo.text
    order_payload = {
        "customer_name": "Smoke Test",
        "customer_phone": "0791234567",
        "customer_address": "Amman smoke test address",
        "items": [{"product_id": product_items[0]["id"], "quantity": 1}],
    }
    order = client.post("/orders", json=order_payload)
    assert order.status_code == 200, order.text
    order_number = order.json()["order_number"]
    lookup = client.get(f"/orders/{order_number}")
    assert lookup.status_code == 200, lookup.text
    settings = get_settings()
    login = client.post("/auth/login", json={"email": settings.admin_email, "password": settings.admin_password})
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    admin_orders = client.get("/admin/orders", headers={"Authorization": f"Bearer {token}"})
    assert admin_orders.status_code == 200, admin_orders.text
    assert any(item["order_number"] == order_number for item in admin_orders.json()), "Created order not visible in dashboard API"
    template = client.get("/admin/excel/template", headers={"Authorization": f"Bearer {token}"})
    assert template.status_code == 200, template.text
    assert template.headers["content-type"].startswith("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    logo_preview = client.get("/admin/logo/preview", headers={"Authorization": f"Bearer {token}"})
    assert logo_preview.status_code == 200, logo_preview.text
    print("Backend smoke test passed: imports, seed data, logo preview, Excel template, order reservation, and admin order visibility.")


if __name__ == "__main__":
    main()
