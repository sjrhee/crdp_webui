from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.schemas import Token, User
from app.core.security import create_access_token, get_current_user
from app.services.auth_service import verify_credentials

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if not verify_credentials(form_data.username, form_data.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    token = create_access_token(subject=form_data.username)
    return Token(access_token=token)

@router.get("/me", response_model=User)
async def me(current_user: str = Depends(get_current_user)):
    return User(username=current_user)
