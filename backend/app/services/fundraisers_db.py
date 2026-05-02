import os

from app.models.fundraiser import Fundraiser

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class FundraiserService:
    """ Service for fundraiser operations in the database."""

    def __init__(self):
        self.table_name = "Fundraiser"  # Adjust to your actual table name

    def add_fundraiser(self, fundraiser_data: dict) -> dict:
        """
        Add a new fundraiser to the database.

        Args:
            fundraiser_data: Dictionary containing fundraiser fields

        Returns:
            Created fundraiser data
        """
        try:
            response = supabase.table(self.table_name).insert(
                fundraiser_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error creating fundraiser: {str(e)}")

    def get_fundraiser(self, fundraiser_id: int) -> dict:
        """
        Retrieve a fundraiser by ID.

        Args:
            fundraiser_id: The ID of the fundraiser

        Returns:
            Fundraiser data or None if not found
        """
        try:
            response = supabase.table(self.table_name).select("*").eq("fundraiserID",
                                                                      fundraiser_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error retrieving fundraiser: {str(e)}")

    def get_all_fundraisers(self) -> list:
        """
        Retrieve all fundraisers from the database.

        Returns:
            List of all fundraisers
        """
        try:
            response = supabase.table(self.table_name).select("*").execute()
            return response.data
        except Exception as e:
            raise Exception(f"Error retrieving fundraisers: {str(e)}")

    def update_fundraiser(self, fundraiser_id: int,
                          update_data: dict) -> dict:
        """
        Update an existing fundraiser.

        Args:
            fundraiser_id: The ID of the fundraiser to update
            update_data: Dictionary containing fields to update

        Returns:
            Updated fundraiser data
        """
        try:
            response = supabase.table(self.table_name).update(
                update_data).eq("fundraiserID", fundraiser_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error updating fundraiser: {str(e)}")

    def update_column(self, fundraiser_id: int, column_name: str, value) -> dict:
        """
        Update a specific column for a fundraiser.

        Args:
            fundraiser_id: The ID of the fundraiser
            column_name: Name of the column to update
            value: New value for the column

        Returns:
            Updated fundraiser data
        """
        return self.update_fundraiser(fundraiser_id, {column_name: value})

    def update_current_amount(self, fundraiser_id: int, new_amount: float):
        return self.update_column(fundraiser_id, "current_amount", new_amount)

fundraiser_service = FundraiserService()
