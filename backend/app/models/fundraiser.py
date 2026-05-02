from pydantic import BaseModel, Field

from backend.models.transaction import Transaction


class Fundraiser(BaseModel):
    fundraiserID: int
    name: str
    transactions: list[Transaction] = Field(default_factory=list)

