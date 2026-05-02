from fastapi import APIRouter

router = APIRouter(
    prefix="/fundraisers",
    tags=["fundraisers"],
)


@router.get("/{fundraiser_id:int}")
async def get_transactions(fundraiser_id: int):
    None  # TODO
