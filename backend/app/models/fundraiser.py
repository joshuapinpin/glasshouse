from pydantic import BaseModel, Field

from backend.app.models.transaction import Transaction


class Fundraiser(BaseModel):
    fundraiserID: int
    name: str
    description: str
    target_amount: float
    current_amount: float
    transactions: list[Transaction] = Field(default_factory=list)

