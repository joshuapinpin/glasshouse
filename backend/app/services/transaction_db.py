import os
from typing import List, Optional

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class TransactionService:
    """Service for transaction operations in the database."""

    def __init__(self):
        self.table_name = "Transactions"  # Adjust to your actual table name

    def add_transaction(self, transaction_data: dict) -> dict:
        """
        Add a new transaction to the database.

        Args:
            transaction_data: Dictionary containing transaction fields

        Returns:
            Created transaction data
        """
        try:
            response = supabase.table(self.table_name).insert(
                transaction_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error creating transaction: {str(e)}")

    def get_transaction(self, transaction_id: int) -> dict:
        """
        Retrieve a transaction by ID.

        Args:
            transaction_id: The ID of the transaction

        Returns:
            Transaction data or None if not found
        """
        try:
            response = supabase.table(self.table_name).select("*").eq(
                "TransactionID", transaction_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error retrieving transaction: {str(e)}")

    def get_transactions_by_fundraiser(self, fundraiser_id: int) -> list:
        """
        Retrieve all transactions for a specific fundraiser.

        Args:
            fundraiser_id: The ID of the fundraiser

        Returns:
            List of transactions for the fundraiser
        """
        try:
            response = supabase.table(self.table_name).select("*").eq(
                "fundraiserID", fundraiser_id).execute()
            return response.data
        except Exception as e:
            raise Exception(
                f"Error retrieving transactions for fundraiser: {str(e)}")


    def update_transaction(self, transaction_id: int,
                           update_data: dict) -> dict:
        """
        Update an existing transaction.

        Args:
            transaction_id: The ID of the transaction to update
            update_data: Dictionary containing fields to update

        Returns:
            Updated transaction data
        """
        try:
            response = supabase.table(self.table_name).update(update_data).eq(
                "transactionID", transaction_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error updating transaction: {str(e)}")

    def update_column(self, transaction_id: int, column_name: str,
                      value) -> dict:
        """
        Update a specific column for a transaction.

        Args:
            transaction_id: The ID of the transaction
            column_name: Name of the column to update
            value: New value for the column

        Returns:
            Updated transaction data
        """
        return self.update_transaction(transaction_id, {column_name: value})

    def update_description(self, transaction_id: int, new_description: str):
        """
        Updates the description of a specified transaction in the database.

        Modifies the 'Description' column for the transaction identified by the
        given transaction ID using the provided new description.

        :param transaction_id: The unique identifier of the transaction whose
            description is to be updated.
            Type: int
        :param new_description: The new description to be set for the transaction.
            Type: str
        :return: A result indicating whether the update operation was successful.
            Specific details of the return value depend on the implementation of the
            `update_column` method.
        """
        return self.update_column(transaction_id, "description", new_description)

    def update_file(self, transaction_id: int, new_file_path: str):
        return self.update_column(transaction_id, "file", new_file_path)

    def delete_transaction(self, transaction_id: int) -> bool:
        """
        Remove a transaction from the database.

        Args:
            transaction_id: The ID of the transaction to delete

        Returns:
            True if deletion was successful
        """
        try:
            response = supabase.table(self.table_name).delete().eq(
                "transactionID", transaction_id).execute()
            return True
        except Exception as e:
            raise Exception(f"Error deleting transaction: {str(e)}")


transaction_service = TransactionService()