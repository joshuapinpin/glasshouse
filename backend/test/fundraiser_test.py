import time
from fastapi.testclient import TestClient

from app.models.fundraiser import Fundraiser
from main import app
from app.services.fundraisers_db import fundraiser_service

client = TestClient(app)

BASE_URL = "http://localhost:8000/auth"

# Test data

def test_add_fundraiser():
    test = Fundraiser(name="Test Fundraiser", description="This is a test fundraiser", target_amount=10000, current_amount=5, fundraiserID=1)
    fundraiser_service.add_fundraiser(test)
