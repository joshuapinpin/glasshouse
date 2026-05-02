from fastapi import APIRouter, HTTPException

from app.models.transaction import Transaction
from app.services.transaction_db import transaction_service
from app.services.akahu_client import akahu_client
from app.services.fundraisers_db import fundraiser_service

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
async def update_transaction_description(transaction_id: int, description: str):
    try:
        response = transaction_service.update_description(transaction_id, description)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/update_file")
async def update_transaction_file(transaction_id: int, filePath: str):
    try:
        response = transaction_service.update_file(transaction_id, filePath)
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

@router.post("/refresh_bank")
async def refresh_bank():
    """Ask Akahu to fetch the latest data from the bank. Rate-limited to once per hour."""
    try:
        result = await akahu_client.refresh_connections()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sync")
async def sync_transactions(fundraiser_id: int):
    """Pull latest transactions from Akahu and upsert into the DB."""
    try:
        fundraiser = fundraiser_service.get_fundraiser(fundraiser_id)
        if not fundraiser:
            raise HTTPException(status_code=404, detail="Fundraiser not found")
        account_id = fundraiser.get("akahu_access_token", "")
        if not account_id:
            raise HTTPException(status_code=400, detail="No Akahu account linked to this fundraiser")
        count = await akahu_client.sync_fundraiser(fundraiser_id, account_id)
        return {"synced": count}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
