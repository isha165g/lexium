from fastapi import FastAPI

import app.core.firebase

from app.api.users import router as user_router
from app.api.health import router as health_router
from app.api.auth import router as auth_router


app = FastAPI(
    title="Lexium API"
)

app.include_router(user_router)
app.include_router(health_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "Lexium Backend Running"
    }