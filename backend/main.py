from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.fundraisers import router as fundraisers_router
from app.routers.transactions import router as transactions_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(fundraisers_router)
app.include_router(transactions_router)


@app.get("/")
async def root():
    return {"message": "Hello World"}
