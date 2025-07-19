#!/bin/bash

echo "Testing duplicate email validation..."

BASE_URL="http://localhost:3000/user"

echo -e "\n1. Creating first user with email test@example.com:"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "test@example.com", "age": 25}' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n2. Trying to create second user with same email:"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith", "email": "test@example.com", "age": 30}' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n3. Testing validation errors with duplicate email and other validation issues:"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{"name": "ab", "email": "test@example.com", "age": -5}' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\nTest completed!"
