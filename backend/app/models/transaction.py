from typing import Optional

from pydantic import BaseModel

class Transaction(BaseModel):
    transactionID: int
    fundraiserID: int
    amount: float
    payee: str
    date: str
    description: Optional[str] = None
    file: Optional[str] = None
