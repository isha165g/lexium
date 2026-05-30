from fastapi import FastAPI

from app.api.users import router as user_router
from app.api.health import router as health_router

app = FastAPI(
    title="Lexium API"
)

app.include_router(user_router)
app.include_router(health_router)


@app.get("/")
def root():
    return {
        "message": "Lexium Backend Running"
    }