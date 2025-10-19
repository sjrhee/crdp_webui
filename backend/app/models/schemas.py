from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    username: str
    password: str

class User(BaseModel):
    username: str

class Item(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
