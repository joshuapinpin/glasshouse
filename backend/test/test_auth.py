# backend/test_auth.py

import time
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

BASE_URL = "http://localhost:8000/auth"

# Test data
TEST_EMAIL = f"richie.moon1green@gmail.com"
TEST_PASSWORD = "testpassword123"


def test_sign_up():
    """Test user sign up"""
    print("\n=== Testing Sign Up ===")
    response = client.post(
        f"{BASE_URL}/signup",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json()


def test_sign_in():
    """Test user sign in"""
    print("\n=== Testing Sign In ===")
    response = client.post(
        f"{BASE_URL}/signin",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Response: {data}")

    # Extract token if available
    if response.status_code == 200:
        try:
            access_token = data.get('session', {}).get('access_token')
            print(
                f"Access Token: {access_token[:50]}..." if access_token else "No token found")
            return access_token
        except:
            return None
    return None


def test_get_user(token):
    """Test getting user details"""
    print("\n=== Testing Get User ===")
    if not token:
        print("No token available, skipping...")
        return

    response = client.get(
        f"{BASE_URL}/user",
        params={"token": token}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")


def test_reset_password():
    """Test password reset"""
    print("\n=== Testing Reset Password ===")
    response = client.post(
        f"{BASE_URL}/reset-password",
        json={
            "email": TEST_EMAIL
        }
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")


def test_sign_out():
    """Test user sign out"""
    print("\n=== Testing Sign Out ===")
    response = client.post(f"{BASE_URL}/signout")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")


def test_invalid_credentials():
    """Test sign in with invalid credentials"""
    print("\n=== Testing Invalid Credentials ===")
    response = client.post(
        f"{BASE_URL}/signin",
        json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        }
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")


def run_all_tests():
    """Run all authentication tests"""
    print("=" * 60)
    print("STARTING AUTHENTICATION TESTS")
    print("=" * 60)
    print(f"Test Email: {TEST_EMAIL}")
    print(f"Test Password: {TEST_PASSWORD}")

    try:
        # Test sign up
        test_sign_up()
        time.sleep(1)

        # Test sign in
        access_token = test_sign_in()
        time.sleep(1)

        # Test get user with token
        test_get_user(access_token)
        time.sleep(1)

        # Test password reset
        test_reset_password()
        time.sleep(1)

        # Test sign out
        test_sign_out()
        time.sleep(1)

        # Test invalid credentials
        test_invalid_credentials()

        print("\n" + "=" * 60)
        print("ALL TESTS COMPLETED")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    run_all_tests()
