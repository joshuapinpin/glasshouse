import time
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

BASE_URL = "http://localhost:8000/fundraisers"

# Test data
TEST_FUNDRAISER_DATA = {
    "fundraiserID": 999,
    "name": "Test Fundraiser",
    "description": "This is a test fundraiser for automated testing",
    "email": "test@example.com",
    "target_amount": 10000.00,
    "current_amount": 0.00,
    "akahu_access_token": "test_token",
}

UPDATED_FUNDRAISER_DATA = {
    "id": 999,
    "title": "Updated Test Fundraiser",
    "description": "This fundraiser has been updated",
    "goal_amount": 15000.00,
    "current_amount": 2500.00,
    "status": "active",
    "created_by": "test@example.com",
}


def test_add_fundraiser():
    """Test adding a new fundraiser"""
    print("\n=== Testing Add Fundraiser ===")
    response = client.post(
        f"{BASE_URL}/add",
        json=TEST_FUNDRAISER_DATA
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Fundraiser created successfully")
        return data
    else:
        print(f"✗ Failed to create fundraiser")
    return None


def test_get_fundraiser(fundraiser_id: int = 999):
    """Test getting a specific fundraiser"""
    print("\n=== Testing Get Fundraiser ===")
    response = client.get(
        f"{BASE_URL}/get",
        params={"fundraiserId": fundraiser_id}
    )
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Response: {data}")

    if response.status_code == 200:
        print(f"✓ Fundraiser retrieved successfully")
        return data
    else:
        print(f"✗ Failed to retrieve fundraiser")
    return None


def test_get_all_fundraisers():
    """Test getting all fundraisers"""
    print("\n=== Testing Get All Fundraisers ===")
    response = client.get(
        f"{BASE_URL}/getAll",
        params={"email": "test@example.com"}
    )
    print(f"Status Code: {response.status_code}")
    data = response.json()

    if response.status_code == 200:
        print(
            f"Total fundraisers: {len(data) if isinstance(data, list) else 'N/A'}")
        print(f"✓ All fundraisers retrieved successfully")
        return data
    else:
        print(f"Response: {data}")
        print(f"✗ Failed to retrieve fundraisers")
    return None


def test_add_duplicate_fundraiser():
    """Test adding a duplicate fundraiser (should handle gracefully)"""
    print("\n=== Testing Add Duplicate Fundraiser ===")
    response = client.post(
        f"{BASE_URL}/add",
        json=TEST_FUNDRAISER_DATA
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code != 200:
        print(f"✓ Duplicate handled appropriately")
    else:
        print(f"⚠ Duplicate was accepted (may need validation)")


def test_get_nonexistent_fundraiser():
    """Test getting a fundraiser that doesn't exist"""
    print("\n=== Testing Get Non-existent Fundraiser ===")
    response = client.get(
        f"{BASE_URL}/get",
        params={"fundraiserId": 999999}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 200:
        data = response.json()
        if data is None or (isinstance(data, dict) and not data):
            print(
                f"✓ Non-existent fundraiser handled correctly (returned empty/null)")
        else:
            print(f"⚠ Unexpected data returned for non-existent fundraiser")
    else:
        print(f"✓ Non-existent fundraiser returned error status")


def test_invalid_fundraiser_data():
    """Test adding a fundraiser with invalid data"""
    print("\n=== Testing Invalid Fundraiser Data ===")
    invalid_data = {
        "id": "not_a_number",  # Invalid type
        "title": "",  # Empty title
        "goal_amount": -1000  # Negative amount
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


def test_fundraiser_workflow():
    """Test complete fundraiser workflow: create -> read -> verify"""
    print("\n=== Testing Complete Fundraiser Workflow ===")

    # Step 1: Create
    print("\n[Step 1] Creating fundraiser...")
    create_response = client.post(f"{BASE_URL}/add", json=TEST_FUNDRAISER_DATA)

    if create_response.status_code != 200:
        print("✗ Failed to create fundraiser, aborting workflow test")
        return

    created_data = create_response.json()
    fundraiser_id = TEST_FUNDRAISER_DATA["id"]
    print(f"✓ Fundraiser created with ID: {fundraiser_id}")

    time.sleep(0.5)

    # Step 2: Read
    print("\n[Step 2] Retrieving fundraiser...")
    get_response = client.get(f"{BASE_URL}/get",
                              params={"fundraiserId": fundraiser_id})

    if get_response.status_code != 200:
        print("✗ Failed to retrieve fundraiser")
        return

    retrieved_data = get_response.json()
    print(f"✓ Fundraiser retrieved successfully")

    # Step 3: Verify
    print("\n[Step 3] Verifying data integrity...")
    if retrieved_data:
        title_match = retrieved_data.get("title") == TEST_FUNDRAISER_DATA[
            "title"]
        goal_match = retrieved_data.get("goal_amount") == TEST_FUNDRAISER_DATA[
            "goal_amount"]

        if title_match and goal_match:
            print("✓ Data integrity verified - all fields match")
        else:
            print("⚠ Data mismatch detected")
            print(f"  Title match: {title_match}")
            print(f"  Goal match: {goal_match}")
    else:
        print("✗ No data returned to verify")

    print("\n✓ Workflow test completed")


def run_all_tests():
    """Run all fundraiser tests"""
    print("=" * 60)
    print("STARTING FUNDRAISER TESTS")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Fundraiser ID: {TEST_FUNDRAISER_DATA['fundraiserID']}")
    try:
        # # Test 1: Add fundraiser
        # test_add_fundraiser()
        # time.sleep(1)

        # Test 2: Get specific fundraiser
        test_get_fundraiser(TEST_FUNDRAISER_DATA["fundraiserID"])
        time.sleep(1)

        # Test 3: Get all fundraisers
        test_get_all_fundraisers()
        time.sleep(1)

        # Test 4: Add duplicate fundraiser
        test_add_duplicate_fundraiser()
        time.sleep(1)

        # Test 5: Get non-existent fundraiser
        test_get_nonexistent_fundraiser()
        time.sleep(1)

        # Test 6: Invalid data
        test_invalid_fundraiser_data()
        time.sleep(1)

        # Test 7: Complete workflow
        test_fundraiser_workflow()

        # print("\n" + "=" * 60)
        # print("ALL TESTS COMPLETED")
        # print("=" * 60)
        # print("\n📊 Summary:")
        # print("   - Add Fundraiser: Tested")
        # print("   - Get Fundraiser: Tested")
        # print("   - Get All Fundraisers: Tested")
        # print("   - Duplicate Handling: Tested")
        # print("   - Non-existent Fundraiser: Tested")
        # print("   - Invalid Data: Tested")
        # print("   - Complete Workflow: Tested")

    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    run_all_tests()