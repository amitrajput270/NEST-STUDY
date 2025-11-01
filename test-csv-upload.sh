#!/bin/bash

# Test script for large CSV file upload

echo "=== CSV File Upload Test Script ==="
echo ""

# Configuration
BASE_URL="http://localhost:3000/api/v1"
TEST_FILE="test-large.csv"
BATCH_SIZE=1000

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to create a test CSV file
create_test_file() {
    local rows=$1
    local filename=$2

    echo -e "${YELLOW}Creating test CSV file with $rows rows...${NC}"

    # Write header
    echo "id,name,email,phone,address,city,country,zipcode" > "$filename"

    # Generate rows
    for ((i=1; i<=rows; i++)); do
        echo "$i,User$i,user$i@example.com,555-000-$i,Address $i,City $i,Country $i,1000$i" >> "$filename"
    done

    local size=$(du -h "$filename" | cut -f1)
    echo -e "${GREEN}Test file created: $filename (Size: $size)${NC}"
    echo ""
}

# Function to test file info endpoint
test_file_info() {
    echo -e "${YELLOW}Test 1: Getting CSV file information...${NC}"

    response=$(curl -s -X POST \
        "$BASE_URL/file-upload/csv/info" \
        -F "file=@$TEST_FILE")

    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo ""
}

# Function to test validation endpoint
test_validation() {
    echo -e "${YELLOW}Test 2: Validating CSV structure...${NC}"

    response=$(curl -s -X POST \
        "$BASE_URL/file-upload/csv/validate?requiredColumns=id,name,email" \
        -F "file=@$TEST_FILE")

    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo ""
}

# Function to test upload and processing
test_upload() {
    echo -e "${YELLOW}Test 3: Uploading and processing CSV file (batch size: $BATCH_SIZE)...${NC}"

    response=$(curl -s -X POST \
        "$BASE_URL/file-upload/csv?batchSize=$BATCH_SIZE" \
        -F "file=@$TEST_FILE")

    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo ""
}

# Function to test with missing required columns
test_validation_fail() {
    echo -e "${YELLOW}Test 4: Testing validation with missing columns (should fail)...${NC}"

    response=$(curl -s -X POST \
        "$BASE_URL/file-upload/csv/validate?requiredColumns=id,name,email,missing_column" \
        -F "file=@$TEST_FILE")

    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo ""
}

# Main execution
main() {
    echo "Starting tests..."
    echo ""

    # Check if server is running
    if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
        echo -e "${RED}Error: Server is not running at $BASE_URL${NC}"
        echo "Please start the NestJS server first: npm run start:dev"
        exit 1
    fi

    # Create test file
    read -p "How many rows do you want in the test file? (default: 10000): " rows
    rows=${rows:-10000}

    create_test_file "$rows" "$TEST_FILE"

    # Run tests
    test_file_info
    test_validation
    test_validation_fail
    test_upload

    # Cleanup
    read -p "Do you want to delete the test file? (y/n): " cleanup
    if [[ $cleanup == "y" || $cleanup == "Y" ]]; then
        rm -f "$TEST_FILE"
        echo -e "${GREEN}Test file deleted.${NC}"
    else
        echo -e "${YELLOW}Test file kept: $TEST_FILE${NC}"
    fi

    echo ""
    echo -e "${GREEN}All tests completed!${NC}"
}

# Run main function
main
