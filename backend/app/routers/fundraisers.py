from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from models.fundraiser import Fundraiser
from app.services.fundraisers_db import fundraiser_service

router = APIRouter(
    prefix="/fundraisers",
    tags=["fundraisers"],
)

@router.post("/add")
async def add_fundraiser(fundraiser: Fundraiser):
    try:
        response = fundraiser_service.add_fundraiser(fundraiser)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get")
async def get_fundraisers(fundraiserId: int):
    try:
        response = fundraiser_service.get_fundraisers(fundraiserId)
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