from fastapi import FastAPI
from app.routers.auth import router as auth_router
from app.routers.transactions import router as transactions_router
from app.routers.fundraisers import router as fundraisers_router

app = FastAPI()
app.include_router(auth_router)
app.include_router(transactions_router)
app.include_router(fundraisers_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}
