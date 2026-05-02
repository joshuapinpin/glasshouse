from fastapi import FastAPI
from backend.app.routers.auth import router as auth_router

app = FastAPI()
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}
