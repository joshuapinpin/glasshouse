from fastapi import FastAPI
from backend.app.routers.auth import router as auth_router

app = FastAPI()
app.include_router(auth_router)
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


@app.get("/fundraisers", response_model=List[FundraiserSummary])
async def list_fundraisers():
    # TODO: replace with real DB query
    return []


@app.get("/fundraisers/{fundraiser_id}", response_model=FundraiserDetail)
async def get_fundraiser(fundraiser_id: str):
    # TODO: replace with real DB query
    raise HTTPException(status_code=404, detail="Fundraiser not found")
