import os

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class AuthService:
    """Service for Supabase authentication operations."""

    @staticmethod
    def sign_up(email: str, password: str) -> dict:
        """
        Register a new user with email and password.
        """
        response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        return response

    @staticmethod
    def sign_in(email: str, password: str) -> dict:
        """
        Sign in an existing user with email and password.
        """
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return response

    @staticmethod
    def sign_out() -> dict:
        """
        Sign out the current user (global scope by default).
        """
        response = supabase.auth.sign_out()
        return response

    @staticmethod
    def get_user(jwt: str) -> dict:
        """
        Get user details from a JWT token.
        """
        response = supabase.auth.get_user(jwt)
        return response

    @staticmethod
    def get_session() -> dict:
        """
        Get the current session.
        """
        response = supabase.auth.get_session()
        return response

    @staticmethod
    def refresh_session(refresh_token: str) -> dict:
        """
        Refresh the session using a refresh token.
        """
        response = supabase.auth.refresh_session(refresh_token)
        return response

    @staticmethod
    def reset_password_email(email: str) -> dict:
        """
        Send a password reset email.
        """
        response = supabase.auth.reset_password_email(email)
        return response

    @staticmethod
    def update_user(jwt: str, attributes: dict) -> dict:
        """
        Update user attributes (e.g., password, email, metadata).
        """
        response = supabase.auth.update_user(attributes)
        return response


auth_service = AuthService()