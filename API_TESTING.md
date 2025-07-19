# API Testing Guide

## All endpoints will now return consistent format:

### Success Response Format:

```json
{
    "statusCode": 200|201|204,
    "message": "Custom message",
    "data": { ... },
    "errors": null
}
```

### Error Response Format:

```json
{
    "statusCode": 400|404|500,
    "message": "Error message",
    "data": null,
    "errors": ["validation error 1", "validation error 2"] // for validation errors only
}
```

## Test URLs (with correct API prefix):

### User Endpoints:

- GET http://localhost:3000/api/v1/user
- POST http://localhost:3000/api/v1/user
- GET http://localhost:3000/api/v1/user/:id
- PUT http://localhost:3000/api/v1/user/:id
- DELETE http://localhost:3000/api/v1/user/:id

### Test Cases:

1. **Valid Request**: `GET /api/v1/user`

   - Returns: Custom format with 200 status

2. **Not Found**: `GET /api/v1/user/invalidid`

   - Returns: Custom format with 404 status

3. **Validation Error**: `POST /api/v1/user` with invalid data

   - Returns: Custom format with 400 status and errors array

4. **Wrong URL**: `GET /user` (without api/v1 prefix)
   - Returns: Custom format with 404 status "Cannot GET /user"

## Testing Commands:

```bash
# Test valid endpoint
curl -X GET http://localhost:3000/api/v1/user

# Test invalid endpoint (will now return custom format)
curl -X GET http://localhost:3000/user

# Test invalid ID (will return custom format)
curl -X DELETE http://localhost:3000/api/v1/user/invalidid
```
