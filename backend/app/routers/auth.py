from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import authenticate_user, create_access_token
from app.database import get_db
from app.deps import get_current_admin
from app.models import User
from app.schemas import LoginRequest, Token, UserOut


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    return Token(access_token=create_access_token(user.email))


@router.post("/logout")
def logout():
    return {"ok": True}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_admin)):
    return user

