from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class TokenError(HTTPException):
    pass


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    expires_delta = timedelta(minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp": datetime.now(timezone.utc) + expires_delta}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub: str = payload.get("sub")
        if sub is None:
            raise TokenError(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        return sub
    except JWTError:
        raise TokenError(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")


def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    return decode_token(token)
