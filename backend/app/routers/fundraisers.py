from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import EmailStr

from models.fundraiser import Fundraiser
from app.services.fundraisers_db import fundraiser_service

router = APIRouter(
    prefix="/fundraisers",
    tags=["fundraisers"],
)


@router.post("/add")
async def add_fundraiser(fundraiser: Fundraiser):
    try:
        response = fundraiser_service.add_fundraiser(fundraiser.model_dump())
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/get")
async def get_fundraisers(fundraiserID: int):
    try:
        response = fundraiser_service.get_fundraiser(fundraiserID)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/getAll")
async def get_all_fundraisers(email: EmailStr):
    try:
        response = fundraiser_service.get_all_fundraisers()
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/update_current_amount")
async def update_current_amount(fundraiserID: int, current_amount: float):
    try:
        response = fundraiser_service.update_current_amount(fundraiserID, current_amount)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
