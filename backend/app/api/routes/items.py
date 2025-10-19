from fastapi import APIRouter, Depends
from typing import List
from app.core.security import get_current_user
from app.models.schemas import Item

router = APIRouter()

_fake_items = [
    Item(id=1, name="Foo", description="A foo item"),
    Item(id=2, name="Bar", description="A bar item"),
]

@router.get("/items", response_model=List[Item])
async def list_items(current_user: str = Depends(get_current_user)):
    return _fake_items
