from pydantic import BaseModel, EmailStr

class Fundraiser(BaseModel):
    fundraiserID: int
    name: str
    description: str
    email: EmailStr
    target_amount: float
    current_amount: float
    akahu_access_token: str

