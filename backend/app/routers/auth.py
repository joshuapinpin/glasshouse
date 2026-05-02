# backend/app/routers/auth.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from backend.app.services.auth_service import auth_service

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr


@router.post("/signup")
def sign_up(request: SignUpRequest):
    try:
        response = auth_service.sign_up(request.email, request.password)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signin")
def sign_in(request: SignInRequest):
    try:
        response = auth_service.sign_in(request.email, request.password)
        return response
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/signout")
def sign_out():
    try:
        response = auth_service.sign_out()
        return {"message": "Signed out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/user")
def get_user(token: str):
    try:
        response = auth_service.get_user(token)
        return response
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    try:
        response = auth_service.reset_password_email(request.email)
        return {"message": "Password reset email sent"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))