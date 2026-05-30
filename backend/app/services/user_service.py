from sqlalchemy.orm import Session

from app.models.user import User


class UserService:

    @staticmethod
    def create_user(
        db: Session,
        firebase_uid: str,
        email: str,
        full_name: str | None = None
    ):
        existing_user = (
            db.query(User)
            .filter(User.firebase_uid == firebase_uid)
            .first()
        )

        if existing_user:
            return existing_user

        user = User(
            firebase_uid=firebase_uid,
            email=email,
            full_name=full_name
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user