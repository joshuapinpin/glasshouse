from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import auth, fundraisers, transactions
app.include_router(auth.router)
app.include_router(fundraisers.router)
app.include_router(transactions.router)


class Transaction(BaseModel):
    Amount: float
    Payee: str
    Date: str
    Description: str
    File: str


class FundraiserDetail(BaseModel):
    Name: str
    Date: str
    Description: str
    TargetAmount: float
    CurrentAmount: float
    Transactions: List[Transaction]


class FundraiserSummary(BaseModel):
    id: str
    Name: str
    CurrentAmount: float
    TargetAmount: float


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


