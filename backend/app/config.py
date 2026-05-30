from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Ghaleb Mall API"
    database_url: str = "sqlite:///./ghaleb_mall.db"
    secret_key: str = "change-me-before-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    admin_email: str = "admin@ghalebmall.local"
    admin_password: str = "ChangeMe123!"
    frontend_url: str = "http://localhost:5173"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    media_root: str = "app/media"
    max_upload_mb: int = 8

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        if self.frontend_url and self.frontend_url not in origins:
            origins.append(self.frontend_url)
        return origins or ["http://localhost:5173"]

    @property
    def media_path(self) -> Path:
        return Path(self.media_root).resolve()


@lru_cache
def get_settings() -> Settings:
    return Settings()

