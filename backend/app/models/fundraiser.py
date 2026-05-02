from pydantic import BaseModel, Field, EmailStr

from backend.app.models.transaction import Transaction


class Fundraiser(BaseModel):
    fundraiserID: int
    name: str
    description: str
    email: EmailStr
    target_amount: float
    current_amount: float
    akahu_access_token: str

