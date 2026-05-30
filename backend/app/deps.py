from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth import decode_token
from app.database import get_db
from app.models import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_admin or not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

