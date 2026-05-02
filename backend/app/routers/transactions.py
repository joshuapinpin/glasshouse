from fastapi import FastAPI, APIRouter

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"],
)

@router.get("/")
async def get_transactions():
    return {"message": "Hello World"}