import os
from app.models.transaction import Transaction

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class TransactionService:
    """ Service for transaction operations in the database."""

    @staticmethod
    def add_transaction(transaction: Transaction) -> dict:
        """Add a new transaction to the database."""
