import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.services.excel import create_product_template  # noqa: E402


def main() -> None:
    output_path = ROOT / "sample_data" / "products_template.xlsx"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(create_product_template().getvalue())
    print(f"Created {output_path}")


if __name__ == "__main__":
    main()

