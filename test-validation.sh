#!/bin/bash

echo "Testing validation response format..."
echo "Starting server..."

# Test with invalid data to see validation errors
# echo -e "\n1. Testing with empty body:"
# curl -X POST http://localhost:3000/api/v1/user \
#   -H "Content-Type: application/json" \
#   -d '{}' \
#   -w "\nHTTP Status: %{http_code}\n"

echo -e "\n2. Testing with invalid name (too short):"
curl -X POST http://localhost:3000/api/v1/user \
  -H "Content-Type: application/json" \
  -d '{"name": "abs", "email": "gaurav@gmail.com", "age": 1}' \
  -w "\nHTTP Status: %{http_code}\n"

# echo -e "\n3. Testing with missing required fields:"
# curl -X POST http://localhost:3000/api/v1/user \
#   -H "Content-Type: application/json" \
#   -d '{"age": 25}' \
#   -w "\nHTTP Status: %{http_code}\n"

echo -e "\nTest completed!"
