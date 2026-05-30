from fastapi import FastAPI

app = FastAPI(
    title="Lexium API",
    version="1.0.0"
)


@app.get("/")
def health_check():
    return {
        "status": "running",
        "service": "Lexium Backend"
    }