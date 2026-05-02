import time
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

BASE_URL = "http://localhost:8000/transactions"

# Test data
TEST_TRANSACTION_DATA = {
    "transactionID": 1,
    "fundraiserID": 999,
    "amount": 250.75,
    "payee": "John Doe",
    "description": "Test donation for education",
    "file": "receipt_test_001.pdf"
}

TEST_TRANSACTION_MINIMAL = {
    "transactionID": 2,
    "fundraiserID": 999,
    "amount": 100.00,
    "payee": "Jane Smith",
    "date": "2026-05-01"
    # description and file are optional
}

UPDATED_TRANSACTION_DATA = {
    "transactionID": 3,
    "fundraiserID": 999,
    "amount": 500.00,
    "payee": "John Doe",
    "date": "2026-05-02",
    "description": "Updated donation amount",
    "file": "receipt_updated_001.pdf"
}


def test_add_transaction():
    """Test adding a new transaction"""
    print("\n=== Testing Add Transaction ===")
    response = client.post(
        f"{BASE_URL}/add",
        json=TEST_TRANSACTION_DATA
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Transaction created successfully")
        print(f"  Transaction ID: {data.get('transactionID')}")
        print(f"  Amount: ${data.get('amount')}")
        print(f"  Payee: {data.get('payee')}")
        return data
    else:
        print(f"✗ Failed to create transaction")
    return None


def test_add_transaction_minimal():
    """Test adding a transaction with only required fields"""
    print("\n=== Testing Add Transaction (Minimal Data) ===")
    response = client.post(
        f"{BASE_URL}/add",
        json=TEST_TRANSACTION_MINIMAL
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 200:
        print(f"✓ Minimal transaction created successfully")
    else:
        print(f"✗ Failed to create minimal transaction")


def test_get_transactions_by_fundraiser():
    """Test getting all transactions for a specific fundraiser"""
    print("\n=== Testing Get Transactions by Fundraiser ===")
    fundraiser_id = 999

    response = client.get(
        f"{BASE_URL}/get_by_fundraiser_id",
        params={"fundraiser_id": fundraiser_id}
    )
    print(f"Status Code: {response.status_code}")
    data = response.json()

    if response.status_code == 200:
        transaction_count = len(data) if isinstance(data, list) else 0
        print(
            f"✓ Retrieved {transaction_count} transaction(s) for fundraiser {fundraiser_id}")

        if transaction_count > 0:
            total_amount = sum(t.get('amount', 0) for t in data)
            print(f"  Total Amount: ${total_amount:.2f}")
            print(
                f"  Sample Transaction: {data[0].get('payee')} - ${data[0].get('amount')}")
        return data
    else:
        print(f"Response: {data}")
        print(f"✗ Failed to retrieve transactions")
    return None


def test_update_transaction_description():
    """Test updating a transaction description"""
    print("\n=== Testing Update Transaction Description ===")
    new_description = "Updated description for testing purposes"

    response = client.put(
        f"{BASE_URL}/update_description",
        params={"description": new_description}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 200:
        print(f"✓ Transaction description updated successfully")
        print(f"  New Description: {new_description}")
    else:
        print(f"✗ Failed to update description")


def test_update_file():
    """Test updating a transaction file path"""
    print("\n=== Testing Update Transaction File ===")
    new_file_path = "receipts/updated_receipt_2026.pdf"

    response = client.put(
        f"{BASE_URL}/update_file",
        params={"transactionID": 1,
                "filePath": new_file_path}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")


def test_update_transaction_file():
    """Test updating a transaction file path"""
    print("\n=== Testing Update Transaction File ===")
    new_file_path = "receipts/updated_receipt_2026.pdf"

    response = client.put(
        f"{BASE_URL}/update_file",
        params={"filePath": new_file_path}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 200:
        print(f"✓ Transaction file updated successfully")
        print(f"  New File Path: {new_file_path}")
    else:
        print(f"✗ Failed to update file path")


def test_invalid_transaction_data():
    """Test adding a transaction with invalid data"""
    print("\n=== Testing Invalid Transaction Data ===")
    invalid_data = {
        "transactionID": "not_a_number",  # Invalid type
        "fundraiserID": -1,  # Invalid fundraiser ID
        "amount": -100.00,  # Negative amount
        "payee": "",  # Empty payee
        "date": "invalid-date"  # Invalid date format
    }

    response = client.post(
        f"{BASE_URL}/add",
        json=invalid_data
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code != 200:
        print(f"✓ Invalid data rejected appropriately")
    else:
        print(f"⚠ Invalid data was accepted (may need validation)")


def test_missing_required_fields():
    """Test adding a transaction with missing required fields"""
    print("\n=== Testing Missing Required Fields ===")
    incomplete_data = {
        "transactionID": 9997,
        "amount": 50.00
        # Missing: fundraiserID, payee, date
    }

    response = client.post(
        f"{BASE_URL}/add",
        json=incomplete_data
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 422:  # Validation error
        print(f"✓ Missing fields detected correctly")
    else:
        print(f"⚠ Incomplete data handling needs review")


def test_get_nonexistent_fundraiser_transactions():
    """Test getting transactions for a fundraiser that doesn't exist"""
    print("\n=== Testing Get Transactions for Non-existent Fundraiser ===")
    response = client.get(
        f"{BASE_URL}/get_by_fundraiser_id",
        params={"fundraiser_id": 999999}
    )
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Response: {data}")

    if response.status_code == 200:
        if isinstance(data, list) and len(data) == 0:
            print(f"✓ Non-existent fundraiser handled correctly (empty list)")
        else:
            print(f"⚠ Unexpected data for non-existent fundraiser")
    else:
        print(f"✓ Non-existent fundraiser returned error status")


def run_all_tests():
    """Run all transaction tests"""
    print("=" * 60)
    print("STARTING TRANSACTION TESTS")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Transaction ID: {TEST_TRANSACTION_DATA['transactionID']}")

    try:
        # Test 1: Add transaction
        # test_add_transaction()
        # time.sleep(1)

        # Test 2: Add minimal transaction
        # test_add_transaction_minimal()
        # time.sleep(1)

        # # Test 3: Get transactions by fundraiser
        # test_get_transactions_by_fundraiser()
        # time.sleep(1)
        #
        # # Test 4: Update description
        # test_update_transaction_description()
        # time.sleep(1)
        #
        # # Test 5: Update file
        # test_update_transaction_file()
        # time.sleep(1)
        #
        # # Test 6: Invalid data
        # test_invalid_transaction_data()
        # time.sleep(1)
        #
        # # Test 7: Missing required fields
        # test_missing_required_fields()
        # time.sleep(1)
        #
        # # Test 8: Non-existent fundraiser
        # test_get_nonexistent_fundraiser_transactions()
        # time.sleep(1)
        #
        # # Test 9: Complete workflow
        # test_transaction_workflow()
        # time.sleep(1)
        #
        # # Test 10: Large amount
        # test_large_transaction_amount()

        test_update_file()

    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    run_all_tests()
