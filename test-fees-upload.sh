#!/bin/bash

# Test script for fees_data CSV file upload

echo "=== Fees Data CSV Upload Test Script ==="
echo ""

# Configuration
BASE_URL="http://localhost:3000/api/v1"
TEST_FILE="test-fees-data.csv"
BATCH_SIZE=500

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to create a test fees data CSV file
create_test_fees_file() {
    local rows=$1
    local filename=$2

    echo -e "${YELLOW}Creating test fees data CSV file with $rows rows...${NC}"

    # Write header - matching your fees_data table structure
    cat > "$filename" << 'HEADER'
sr,date,academic_year,session,alloted_category,voucher_type,voucher_no,roll_no,admno_uniqueid,status,fee_category,faculty,program,department,batch,receipt_no,fee_head,due_amount,paid_amount,concession_amount,scholarship_amount,reverse_concession_amount,write_off_amount,adjusted_amount,refund_amount,fund_trancfer_amount,remarks
HEADER

    # Generate rows with realistic data
    for ((i=1; i<=rows; i++)); do
        local sr=$i
        local date=$(date -v-${i}d +%Y-%m-%d 2>/dev/null || date -d "-${i} days" +%Y-%m-%d 2>/dev/null)
        local academic_year="2024-25"
        local session="ODD"
        local alloted_category="General"
        local voucher_type="Fee"
        local voucher_no="V$(printf "%06d" $i)"
        local roll_no="ROLL$(printf "%05d" $i)"
        local admno_uniqueid="ADM$(printf "%08d" $i)"
        local status="Active"
        local fee_category="Regular"
        local faculty="Engineering"
        local program="B.Tech"
        local department="Computer Science"
        local batch="2024"
        local receipt_no="RCP$(printf "%08d" $i)"
        local fee_head="Tuition Fee"
        local due_amount=$(awk -v min=5000 -v max=50000 'BEGIN{srand(); print int(min+rand()*(max-min+1))}')
        local paid_amount=$(awk -v due=$due_amount 'BEGIN{srand(); print int(due*0.8+rand()*(due*0.2))}')
        local concession_amount=$(awk -v due=$due_amount 'BEGIN{srand(); print int(rand()*(due*0.1))}')
        local scholarship_amount=$(awk -v due=$due_amount 'BEGIN{srand(); print int(rand()*(due*0.15))}')
        local reverse_concession_amount=0
        local write_off_amount=0
        local adjusted_amount=0
        local refund_amount=0
        local fund_trancfer_amount=0
        local remarks="Test record $i"

        echo "$sr,$date,$academic_year,$session,$alloted_category,$voucher_type,$voucher_no,$roll_no,$admno_uniqueid,$status,$fee_category,$faculty,$program,$department,$batch,$receipt_no,$fee_head,$due_amount,$paid_amount,$concession_amount,$scholarship_amount,$reverse_concession_amount,$write_off_amount,$adjusted_amount,$refund_amount,$fund_trancfer_amount,$remarks" >> "$filename"
    done

    local size=$(du -h "$filename" | cut -f1)
    local line_count=$(wc -l < "$filename")
    echo -e "${GREEN}Test file created: $filename${NC}"
    echo -e "${GREEN}Size: $size | Lines: $line_count (including header)${NC}"
    echo ""
}

# Function to display CSV sample
show_csv_sample() {
    echo -e "${BLUE}=== CSV Sample (first 3 rows) ===${NC}"
    head -n 4 "$TEST_FILE" | column -t -s,
    echo ""
}

# Function to test file info endpoint
test_file_info() {
    echo -e "${YELLOW}Test 1: Getting fees CSV file information...${NC}"

    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
        "$BASE_URL/file-upload/csv/info" \
        -F "file=@$TEST_FILE")

    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    body=$(echo "$response" | sed '$d')

    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✓ Status: $http_status${NC}"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Status: $http_status${NC}"
        echo "$body"
    fi
    echo ""
}

# Function to test validation endpoint
test_validation() {
    echo -e "${YELLOW}Test 2: Validating fees CSV structure...${NC}"
    local required_cols="sr,date,academic_year,roll_no,admno_uniqueid,fee_head,due_amount,paid_amount"

    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
        "$BASE_URL/file-upload/csv/validate?requiredColumns=$required_cols" \
        -F "file=@$TEST_FILE")

    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    body=$(echo "$response" | sed '$d')

    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✓ Status: $http_status${NC}"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Status: $http_status${NC}"
        echo "$body"
    fi
    echo ""
}

# Function to test upload and processing
test_upload() {
    echo -e "${YELLOW}Test 3: Uploading and processing fees CSV file...${NC}"
    echo -e "${BLUE}Batch size: $BATCH_SIZE${NC}"
    echo -e "${BLUE}This may take a while for large files...${NC}"
    echo ""

    start_time=$(date +%s)

    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
        "$BASE_URL/file-upload/csv?batchSize=$BATCH_SIZE" \
        -F "file=@$TEST_FILE")

    end_time=$(date +%s)
    duration=$((end_time - start_time))

    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    body=$(echo "$response" | sed '$d')

    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✓ Status: $http_status${NC}"
        echo -e "${GREEN}✓ Processing time: ${duration} seconds${NC}"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Status: $http_status${NC}"
        echo -e "${RED}✗ Processing time: ${duration} seconds${NC}"
        echo "$body"
    fi
    echo ""
}

# Function to verify database insertion
test_database_verification() {
    echo -e "${YELLOW}Test 4: Database Verification${NC}"
    echo -e "${BLUE}Please verify the data in your MySQL database:${NC}"
    echo ""
    echo "Run this query in your MySQL client:"
    echo ""
    echo -e "${GREEN}SELECT COUNT(*) as total_records FROM fees_data;${NC}"
    echo -e "${GREEN}SELECT * FROM fees_data ORDER BY id DESC LIMIT 5;${NC}"
    echo ""
}

# Main execution
main() {
    echo "Starting fees data CSV upload tests..."
    echo ""

    # Check if server is running
    echo -e "${BLUE}Checking if server is running...${NC}"
    if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
        echo -e "${RED}Error: Server is not running at $BASE_URL${NC}"
        echo "Please start the NestJS server first:"
        echo "  npm run start:dev"
        exit 1
    fi
    echo -e "${GREEN}✓ Server is running${NC}"
    echo ""

    # Get number of rows
    read -p "How many fee records do you want to generate? (default: 1000): " rows
    rows=${rows:-1000}

    # Get batch size
    read -p "Batch size for processing? (default: 500): " batch
    BATCH_SIZE=${batch:-500}

    # Create test file
    create_test_fees_file "$rows" "$TEST_FILE"

    # Show sample
    show_csv_sample

    # Run tests
    read -p "Press Enter to continue with tests..."

    test_file_info

    read -p "Press Enter to continue..."
    test_validation

    read -p "Press Enter to upload and process the file (this will insert data into database)..."
    test_upload

    test_database_verification

    # Cleanup
    echo ""
    read -p "Do you want to delete the test CSV file? (y/n): " cleanup
    if [[ $cleanup == "y" || $cleanup == "Y" ]]; then
        rm -f "$TEST_FILE"
        echo -e "${GREEN}Test file deleted.${NC}"
    else
        echo -e "${YELLOW}Test file kept: $TEST_FILE${NC}"
    fi

    echo ""
    echo -e "${GREEN}All tests completed!${NC}"
    echo ""
    echo -e "${BLUE}Summary:${NC}"
    echo "- Test file: $TEST_FILE"
    echo "- Records generated: $rows"
    echo "- Batch size: $BATCH_SIZE"
    echo "- Base URL: $BASE_URL"
}

# Run main function
main
