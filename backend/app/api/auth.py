from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.services.user_service import UserService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.get("/me")
def me(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = UserService.get_or_create_user(
        db=db,
        firebase_uid=current_user["uid"],
        email=current_user["email"],
        full_name=current_user.get("name")
    )

    return {
        "uid": user.firebase_uid,
        "email": user.email,
        "name": user.full_name
    }