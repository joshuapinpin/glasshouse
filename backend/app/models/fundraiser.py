from typing import Optional
from pydantic import BaseModel, Field, EmailStr

from app.models.transaction import Transaction


class Fundraiser(BaseModel):
    fundraiserID: Optional[int] = None
    name: str
    description: str
    email: EmailStr
    target_amount: float
    current_amount: float
    akahu_access_token: Optional[str] = None

