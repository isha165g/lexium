from fastapi import Header
from fastapi import HTTPException

from app.services.auth_service import AuthService


async def get_current_user(
    authorization: str = Header(None)
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Missing token"
        )

    token = authorization.replace(
        "Bearer ",
        ""
    )

    return AuthService.verify_token(
        token
    )