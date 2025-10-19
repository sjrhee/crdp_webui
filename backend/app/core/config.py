from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pydantic import field_validator
import json
import os

class Settings(BaseSettings):
    APP_NAME: str = "FastAPI Starter"
    DEBUG: bool = True
    SECRET_KEY: str = "change_me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    # demo credentials for sample app
    DEMO_USERNAME: str = "demo"
    DEMO_PASSWORD: str = "demo"

    # CRDP defaults
    CRDP_API_HOST: str = "192.168.0.231"
    CRDP_API_PORT: int = 32082
    CRDP_PROTECTION_POLICY: str = "P03"
    CRDP_SAMPLE_DATA: str = "1234567890123"
    # Accept JSON array or comma-separated string for CORS_ORIGINS
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors(cls, v):
        if isinstance(v, str):
            s = v.strip()
            if s.startswith("["):
                try:
                    return json.loads(s)
                except Exception:
                    return [s]
            return [x.strip() for x in s.split(",") if x.strip()]
        return v
    model_config = SettingsConfigDict(env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", ".env"), env_file_encoding="utf-8", case_sensitive=False)

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
