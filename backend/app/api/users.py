from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.core.security import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def get_users(
    db: Session = Depends(get_db)
):
    return {
        "message": "Users endpoint working"
    }

@router.get("/me")
def me(
    current_user=Depends(
        get_current_user
    )
):
    return current_user    