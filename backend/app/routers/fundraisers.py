from fastapi import APIRouter
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import EmailStr

from models.fundraiser import Fundraiser
from app.services.fundraisers_db import fundraiser_service

router = APIRouter(
    prefix="/fundraisers",
    tags=["fundraisers"],
)


@router.get("/{fundraiser_id:int}")
async def get_transactions(fundraiser_id: int):
    None  # TODO
@router.post("/add")
async def add_fundraiser(fundraiser: Fundraiser):
    try:
        print("here")
        response = fundraiser_service.add_fundraiser(fundraiser.model_dump())
        print(f"here2: {response}")
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get")
async def get_fundraisers(fundraiserId: int):
    try:
        response = fundraiser_service.get_fundraiser(fundraiserId)
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
