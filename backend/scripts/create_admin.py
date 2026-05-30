import getpass
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.auth import get_password_hash  # noqa: E402
from app.database import SessionLocal, init_db  # noqa: E402
from app.models import User  # noqa: E402


def main() -> None:
    init_db()
    email = input("Admin email: ").strip()
    password = getpass.getpass("Admin password: ")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.hashed_password = get_password_hash(password)
            user.is_admin = True
            user.is_active = True
            print("Updated existing admin user.")
        else:
            db.add(User(email=email, hashed_password=get_password_hash(password), full_name="Ghaleb Mall Admin", is_admin=True, is_active=True))
            print("Created admin user.")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()

