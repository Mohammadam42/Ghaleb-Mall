import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database import SessionLocal, init_db  # noqa: E402
from app.seed_data import seed_database  # noqa: E402


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        result = seed_database(db)
        print(f"Seed complete: {result}")
    finally:
        db.close()


if __name__ == "__main__":
    main()

