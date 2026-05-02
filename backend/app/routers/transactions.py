from fastapi import APIRouter, HTTPException

from app.models.transaction import Transaction
from app.services.transaction_db import transaction_service

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"],
)

@router.post("/add")
async def add_transaction(transaction: Transaction):
    try:
        response = transaction_service.add_transaction(transaction.model_dump())
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/update_description")
async def update_transaction_description(description: str):
    try:
        response = transaction_service.update_description(description)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/update_file")
async def update_transaction_file(transactionID: int, filePath: str):
    try:
        response = transaction_service.update_file(transactionID, filePath)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get_by_fundraiser_id")
async def get_transactions_by_fundraiser_id(fundraiser_id: int):
    try:
        response = transaction_service.get_transactions_by_fundraiser(fundraiser_id)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

