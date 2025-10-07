# Test User Credentials

## Overview

This document contains pre-configured test user credentials for testing the Tourist Safety API. These users are automatically created when running the database seed script.

## Test User Accounts

### Test User 1
- **Email:** `testuser1@example.com`
- **Password:** `Test@123`
- **Emergency Contact:** +91-9876543210
- **Use Case:** General testing and API exploration

### Test User 2
- **Email:** `testuser2@example.com`
- **Password:** `Test@456`
- **Emergency Contact:** +91-9876543211
- **Use Case:** Multi-user testing scenarios

### Test User 3
- **Email:** `testuser3@example.com`
- **Password:** `Test@789`
- **Emergency Contact:** +91-9876543212
- **Use Case:** Location tracking tests

### Test User 4
- **Email:** `testuser4@example.com`
- **Password:** `Test@321`
- **Emergency Contact:** +91-9876543213
- **Use Case:** SOS and emergency alert testing

### Test User 5
- **Email:** `testuser5@example.com`
- **Password:** `Test@654`
- **Emergency Contact:** +91-9876543214
- **Use Case:** Nearby tourist detection testing

---

## Quick Test Commands

### Login with Test User 1

```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser1@example.com","password":"Test@123"}'
```

### Login with Test User 2

```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser2@example.com","password":"Test@456"}'
```

### Login All Users (Bash Script)

```bash
#!/bin/bash
for i in {1..5}; do
  case $i in
    1) pass="Test@123" ;;
    2) pass="Test@456" ;;
    3) pass="Test@789" ;;
    4) pass="Test@321" ;;
    5) pass="Test@654" ;;
  esac
  
  echo "Testing testuser$i@example.com..."
  curl -s -X POST http://localhost:8000/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"testuser$i@example.com\",\"password\":\"$pass\"}" | jq .
  echo ""
done
```

---

## Setup Instructions

### Create Test Users

The test users are automatically created when you run the seed script:

```bash
cd geofencing_module
python3 seed.py
```

Or create them separately:

```bash
cd geofencing_module
python3 seed_test_users.py
```

### Verify Test Users

Check if test users exist in the database:

```bash
cd geofencing_module
sqlite3 tourists.db "SELECT name, email FROM tourists WHERE email LIKE 'testuser%@example.com';"
```

Expected output:
```
Test User 1|testuser1@example.com
Test User 2|testuser2@example.com
Test User 3|testuser3@example.com
Test User 4|testuser4@example.com
Test User 5|testuser5@example.com
```

---

## Usage Examples

### 1. Test Authentication Flow

```bash
# Register is not needed - users are pre-created
# Just login directly

TOKEN=$(curl -s -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser1@example.com","password":"Test@123"}' | jq -r '.access_token')

echo "Token: $TOKEN"
```

### 2. Update Location

```bash
# Login first
TOKEN=$(curl -s -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser1@example.com","password":"Test@123"}' | jq -r '.access_token')

# Update location
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":28.6139,"longitude":77.2090}'
```

### 3. Send SOS Alert

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser2@example.com","password":"Test@456"}' | jq -r '.access_token')

# Send SOS
curl -X POST http://localhost:8000/sos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":19.076,"longitude":72.8777,"message":"Need help!"}'
```

### 4. Multi-User Testing

Test nearby tourist detection with multiple users:

```bash
# User 1: Update location to Delhi
TOKEN1=$(curl -s -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser1@example.com","password":"Test@123"}' | jq -r '.access_token')

curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"latitude":28.6139,"longitude":77.2090}'

# User 2: Update location near User 1
TOKEN2=$(curl -s -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser2@example.com","password":"Test@456"}' | jq -r '.access_token')

curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"latitude":28.6200,"longitude":77.2150}'

# User 1 sends SOS - User 2 should be alerted
curl -X POST http://localhost:8000/sos \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"latitude":28.6139,"longitude":77.2090,"message":"Emergency!"}'
```

### 5. Test Password Reset

```bash
# Request password reset
curl -X POST http://localhost:8000/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser3@example.com"}'

# Note: In development, the reset token is returned in the response
# In production, it should be sent via email
```

---

## Frontend Testing

### Web Application

1. Open `http://localhost:8080/index.html`
2. Click "Continue without wallet" or register
3. Use any test user credentials to login

### Mobile App

1. Start the mobile app: `cd ui && npm run dev`
2. Open the app in a simulator or on device
3. Use test credentials to login:
   - Email: `testuser1@example.com`
   - Password: `Test@123`

---

## Automated Testing

### Run Complete Test Suite

```bash
# Test all features including test user logins
./test_new_features.sh
```

### Test Only User Authentication

```bash
#!/bin/bash
echo "Testing authentication for all 5 test users..."

for i in {1..5}; do
  case $i in
    1) pass="Test@123" ;;
    2) pass="Test@456" ;;
    3) pass="Test@789" ;;
    4) pass="Test@321" ;;
    5) pass="Test@654" ;;
  esac
  
  response=$(curl -s -X POST http://localhost:8000/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"testuser$i@example.com\",\"password\":\"$pass\"}")
  
  if echo "$response" | grep -q "access_token"; then
    echo "✓ Test User $i login successful"
  else
    echo "✗ Test User $i login failed"
  fi
done
```

---

## Security Notes

### Development vs Production

⚠️ **Important:** These credentials are for **testing purposes only** and should:

1. **Never be used in production environments**
2. Be changed or removed before production deployment
3. Not be shared publicly or committed to version control with real user data

### Password Policy

Test passwords follow a standard pattern:
- Minimum 8 characters
- Contains uppercase and lowercase letters
- Contains numbers
- Contains special characters (@)

### Best Practices

1. **For Development:**
   - Use these test credentials for local development
   - They are safe to share within the development team
   - Recreate them easily with the seed script

2. **For Production:**
   - Remove or disable test accounts
   - Implement proper user registration flow
   - Use strong, randomly generated passwords
   - Enable email verification
   - Implement rate limiting on login attempts

---

## Troubleshooting

### Test Users Not Found

If you get "Incorrect email or password" errors:

```bash
# Recreate test users
cd geofencing_module
python3 seed_test_users.py
```

### Login Fails with Valid Credentials

1. Check if backend server is running:
   ```bash
   curl http://localhost:8000/
   ```

2. Verify test users exist:
   ```bash
   sqlite3 geofencing_module/tourists.db "SELECT * FROM tourists WHERE email='testuser1@example.com';"
   ```

3. Check password hash is not null:
   ```bash
   sqlite3 geofencing_module/tourists.db "SELECT email, password_hash FROM tourists WHERE email='testuser1@example.com';"
   ```

### Reset Test Users

To start fresh:

```bash
# Remove all test users
cd geofencing_module
sqlite3 tourists.db "DELETE FROM tourists WHERE email LIKE 'testuser%@example.com';"

# Recreate them
python3 seed_test_users.py
```

---

## API Documentation

For complete API documentation, see:
- [NEW_FEATURES_GUIDE.md](NEW_FEATURES_GUIDE.md)
- [QUICK_START.md](QUICK_START.md)
- API Interactive Docs: http://localhost:8000/docs

---

## Support

For issues or questions:
1. Check if backend is running: `curl http://localhost:8000/`
2. Verify database exists: `ls geofencing_module/tourists.db`
3. Review logs in the terminal where uvicorn is running
4. Run the automated test script: `./test_new_features.sh`
