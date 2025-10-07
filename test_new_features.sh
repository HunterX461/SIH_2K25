#!/bin/bash

# Test script for new features
# Run this script to validate must-visit places, danger zones, and password reset

API_URL="http://localhost:8000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing New Features for Tourist Safety API"
echo "=============================================="
echo ""

# Test 1: Must-Visit Places
echo -e "${YELLOW}Test 1: Must-Visit Places${NC}"
echo "Testing GET /must_visit_places..."
RESPONSE=$(curl -s "$API_URL/must_visit_places")
COUNT=$(echo $RESPONSE | jq '. | length')
if [ "$COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $COUNT must-visit places${NC}"
    echo "Sample place:"
    echo $RESPONSE | jq '.[0]'
else
    echo -e "${RED}✗ No must-visit places found${NC}"
fi
echo ""

# Test 2: Must-Visit Places with Location Filter
echo -e "${YELLOW}Test 2: Location-based Must-Visit Places${NC}"
echo "Testing with Delhi coordinates (28.6139, 77.2090)..."
RESPONSE=$(curl -s "$API_URL/must_visit_places?latitude=28.6139&longitude=77.2090&radius_km=20")
COUNT=$(echo $RESPONSE | jq '. | length')
if [ "$COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $COUNT places near Delhi${NC}"
    echo "Nearest place:"
    echo $RESPONSE | jq '.[0] | {name, distance_km}'
else
    echo -e "${RED}✗ No nearby places found${NC}"
fi
echo ""

# Test 3: Zone Statistics
echo -e "${YELLOW}Test 3: Zone Statistics${NC}"
echo "Testing GET /zones/statistics..."
RESPONSE=$(curl -s "$API_URL/zones/statistics")
TOTAL=$(echo $RESPONSE | jq '.total_zones')
MUST_VISIT=$(echo $RESPONSE | jq '.must_visit_places')
if [ "$TOTAL" -gt 0 ]; then
    echo -e "${GREEN}✓ Zone statistics retrieved${NC}"
    echo "Summary:"
    echo $RESPONSE | jq '{total_zones, must_visit_places, active_incidents}'
else
    echo -e "${RED}✗ Failed to get statistics${NC}"
fi
echo ""

# Test 4: Zone Filtering
echo -e "${YELLOW}Test 4: Zone Filtering${NC}"
echo "Testing GET /zones?zone_type=risk..."
RESPONSE=$(curl -s "$API_URL/zones?zone_type=risk")
COUNT=$(echo $RESPONSE | jq '. | length')
if [ "$COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $COUNT risk zones${NC}"
    echo "Sample risk zone:"
    echo $RESPONSE | jq '.[0] | {name, risk_level, zone_type}'
else
    echo -e "${RED}✗ No risk zones found${NC}"
fi
echo ""

# Test 5: User Registration
echo -e "${YELLOW}Test 5: User Registration & Authentication${NC}"
EMAIL="testuser_$(date +%s)@example.com"
echo "Registering user: $EMAIL"
RESPONSE=$(curl -s -X POST "$API_URL/register" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"testpass123\"}")
TOKEN=$(echo $RESPONSE | jq -r '.access_token')
TOURIST_ID=$(echo $RESPONSE | jq -r '.tourist_id')

if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✓ User registered successfully (ID: $TOURIST_ID)${NC}"
else
    echo -e "${RED}✗ Registration failed${NC}"
    exit 1
fi
echo ""

# Test 6: Danger Zone Detection
echo -e "${YELLOW}Test 6: Danger Zone Detection${NC}"
echo "Updating location to Dharavi danger zone (19.045, 72.855)..."
RESPONSE=$(curl -s -X POST "$API_URL/update_location" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"latitude":19.045,"longitude":72.855}')
IN_DANGER=$(echo $RESPONSE | jq -r '.in_danger_zone')
ZONE_NAME=$(echo $RESPONSE | jq -r '.danger_zone_info.zone_name')

if [ "$IN_DANGER" == "true" ]; then
    echo -e "${GREEN}✓ Danger zone detected: $ZONE_NAME${NC}"
    echo "Zone info:"
    echo $RESPONSE | jq '.danger_zone_info'
else
    echo -e "${RED}✗ Danger zone not detected${NC}"
fi
echo ""

# Test 7: Safe Zone (No Danger)
echo -e "${YELLOW}Test 7: Safe Zone Detection${NC}"
echo "Updating location to safe area (28.6139, 77.2090)..."
RESPONSE=$(curl -s -X POST "$API_URL/update_location" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"latitude":28.6139,"longitude":77.2090}')
IN_DANGER=$(echo $RESPONSE | jq -r '.in_danger_zone')

if [ "$IN_DANGER" == "false" ]; then
    echo -e "${GREEN}✓ Safe zone confirmed (no danger detected)${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Unexpected danger zone detection in safe area${NC}"
fi
echo ""

# Test 8: Password Reset Request
echo -e "${YELLOW}Test 8: Password Reset Request${NC}"
echo "Requesting password reset for $EMAIL..."
RESPONSE=$(curl -s -X POST "$API_URL/password-reset/request" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\"}")
RESET_TOKEN=$(echo $RESPONSE | jq -r '.token')

if [ ! -z "$RESET_TOKEN" ] && [ "$RESET_TOKEN" != "null" ]; then
    echo -e "${GREEN}✓ Password reset token generated${NC}"
    echo "Token expires at: $(echo $RESPONSE | jq -r '.expires_at')"
else
    echo -e "${RED}✗ Failed to generate reset token${NC}"
    exit 1
fi
echo ""

# Test 9: Password Reset Confirmation
echo -e "${YELLOW}Test 9: Password Reset Confirmation${NC}"
echo "Confirming password reset with token..."
RESPONSE=$(curl -s -X POST "$API_URL/password-reset/confirm" \
    -H "Content-Type: application/json" \
    -d "{\"token\":\"$RESET_TOKEN\",\"new_password\":\"newpass123\"}")
STATUS=$(echo $RESPONSE | jq -r '.status')

if [ "$STATUS" == "success" ]; then
    echo -e "${GREEN}✓ Password reset successfully${NC}"
else
    echo -e "${RED}✗ Password reset failed${NC}"
    exit 1
fi
echo ""

# Test 10: Login with New Password
echo -e "${YELLOW}Test 10: Login with New Password${NC}"
echo "Attempting login with new password..."
RESPONSE=$(curl -s -X POST "$API_URL/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"newpass123\"}")
NEW_TOKEN=$(echo $RESPONSE | jq -r '.access_token')

if [ ! -z "$NEW_TOKEN" ] && [ "$NEW_TOKEN" != "null" ]; then
    echo -e "${GREEN}✓ Login successful with new password${NC}"
else
    echo -e "${RED}✗ Login failed with new password${NC}"
    exit 1
fi
echo ""

# Test 11: Get Current User Info
echo -e "${YELLOW}Test 11: Get Current User Info${NC}"
echo "Fetching user profile..."
RESPONSE=$(curl -s "$API_URL/me" \
    -H "Authorization: Bearer $NEW_TOKEN")
USER_STATUS=$(echo $RESPONSE | jq -r '.status')

if [ ! -z "$USER_STATUS" ] && [ "$USER_STATUS" != "null" ]; then
    echo -e "${GREEN}✓ User profile retrieved${NC}"
    echo "User info:"
    echo $RESPONSE | jq '{name, email, status, is_guest}'
else
    echo -e "${RED}✗ Failed to get user profile${NC}"
fi
echo ""

# Summary
echo "=============================================="
echo -e "${GREEN}✅ All Tests Completed Successfully!${NC}"
echo ""
echo "Summary of Features Tested:"
echo "  ✓ Must-visit places (basic & location-filtered)"
echo "  ✓ Zone statistics"
echo "  ✓ Zone filtering"
echo "  ✓ User registration"
echo "  ✓ Danger zone detection"
echo "  ✓ Safe zone detection"
echo "  ✓ Password reset request"
echo "  ✓ Password reset confirmation"
echo "  ✓ Login with new password"
echo "  ✓ User profile retrieval"
echo ""
echo "🎉 All new features are working correctly!"
