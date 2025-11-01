#!/bin/bash

# Debug script to test CSV parsing

echo "=== CSV Debug Test ==="
echo ""

CSV_FILE="${1:-fees-data-template.csv}"

if [ ! -f "$CSV_FILE" ]; then
    echo "Error: File not found: $CSV_FILE"
    exit 1
fi

echo "Testing file: $CSV_FILE"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/api/v1 > /dev/null 2>&1; then
    echo "Error: Server is not running"
    echo "Start with: npm run start:dev"
    exit 1
fi

echo "1. Using debug endpoint to see raw CSV data..."
echo ""

response=$(curl -s -X POST \
    "http://localhost:3000/api/v1/file-upload/csv/debug" \
    -F "file=@$CSV_FILE")

echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"

echo ""
echo "2. Check your application logs for detailed transformation info:"
echo "   tail -f logs/\$(date +%Y/%m/%d)/general-*.log"
