import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import get_settings


ALLOWED_IMAGE_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
ALLOWED_EXCEL_TYPES = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-excel": ".xls",
}


def ensure_media_root() -> Path:
    settings = get_settings()
    settings.media_path.mkdir(parents=True, exist_ok=True)
    return settings.media_path


def assert_upload_size(upload: UploadFile) -> None:
    settings = get_settings()
    upload.file.seek(0, 2)
    size = upload.file.tell()
    upload.file.seek(0)
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if size > max_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File is too large")


def save_upload(upload: UploadFile, folder: str = "uploads", allow_excel: bool = False) -> tuple[str, str, int]:
    content_type = upload.content_type or ""
    allowed = dict(ALLOWED_IMAGE_TYPES)
    if allow_excel:
        allowed.update(ALLOWED_EXCEL_TYPES)
    if content_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {content_type}")
    assert_upload_size(upload)
    root = ensure_media_root()
    target_dir = root / folder
    target_dir.mkdir(parents=True, exist_ok=True)
    extension = allowed[content_type]
    filename = f"{uuid.uuid4().hex}{extension}"
    destination = target_dir / filename
    with destination.open("wb") as buffer:
        shutil.copyfileobj(upload.file, buffer)
    url = f"/media/{folder}/{filename}"
    return filename, url, destination.stat().st_size


def delete_media_url(url: str) -> None:
    if not url.startswith("/media/"):
        return
    root = ensure_media_root()
    relative = url.replace("/media/", "", 1)
    path = (root / relative).resolve()
    if root in path.parents and path.exists():
        path.unlink()

