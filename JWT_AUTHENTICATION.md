# JWT Authentication Implementation - Complete Guide

## Overview

We have successfully implemented JWT (JSON Web Token) authentication with best practices in your NestJS application. This implementation includes:

- User registration with email/password
- User login with JWT token generation
- Refresh token mechanism for extended sessions
- Protected routes using JWT guards
- Password hashing with bcrypt
- Type-safe DTOs with validation
- Proper error handling

## Authentication Endpoints

### 1. User Registration

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "your_secure_password",
  "name": "Your Name",
  "age": 25
}
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": "7d",
    "token_type": "Bearer",
    "user": {
      "name": "Your Name",
      "email": "user@example.com",
      "age": 25
    }
  },
  "errors": null,
  "trace": null
}
```

### 2. User Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "your_secure_password"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": "7d",
    "token_type": "Bearer",
    "user": {
      "id": 13,
      "name": "Your Name",
      "email": "user@example.com",
      "age": 25
    }
  },
  "errors": null,
  "trace": null
}
```

### 3. Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": "7d",
    "token_type": "Bearer",
    "user": {
      "id": 13,
      "name": "Your Name",
      "email": "user@example.com",
      "age": 25
    }
  },
  "errors": null,
  "trace": null
}
```

### 4. Get User Profile (Protected)

**Endpoint:** `GET /api/v1/auth/profile`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 13,
    "email": "user@example.com",
    "name": "Your Name"
  },
  "errors": null,
  "trace": null
}
```

## Protected Routes Example

### Protected User Route

**Endpoint:** `GET /api/v1/user/get-users-with-posts`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

This route demonstrates how to protect any endpoint and access the current user's information.

## Implementation Features

### 🔐 Security Features

- **Password Hashing:** Uses bcrypt with salt rounds (12) for secure password storage
- **JWT Tokens:** Access tokens expire in 7 days, refresh tokens in 30 days
- **Email Validation:** Proper email format validation
- **Password Requirements:** Minimum 6 characters required
- **Conflict Prevention:** Prevents duplicate email registration

### 🛡️ Guards and Decorators

- **JwtAuthGuard:** Protects routes requiring authentication
- **@CurrentUser():** Decorator to access current user in controllers
- **Passport Integration:** Uses passport-jwt for token validation

### 📝 Validation

- **DTO Validation:** Using class-validator for request validation
- **Email Format:** Validates proper email format
- **Password Length:** Minimum 6 characters
- **Required Fields:** All registration fields are validated

### 🔄 Token Management

- **Access Tokens:** Short-lived (7 days) for API access
- **Refresh Tokens:** Long-lived (30 days) for token renewal
- **Automatic Refresh:** Client can refresh tokens without re-login

## Error Handling

### Common Error Responses

**401 Unauthorized (No Token):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "data": null,
  "errors": "Unauthorized",
  "trace": {
    "file": "/node_modules/@nestjs/passport/dist/auth.guard.js",
    "line": "60",
    "column": "30"
  }
}
```

**409 Conflict (Email Already Exists):**

```json
{
  "statusCode": 409,
  "message": "Conflict",
  "data": null,
  "errors": "User with this email already exists",
  "trace": {
    "file": "/src/auth/auth.service.ts",
    "line": "24",
    "column": "19"
  }
}
```

**400 Bad Request (Validation Error):**

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "data": null,
  "errors": {
    "email": ["email must be an email"],
    "password": ["password must be longer than or equal to 6 characters"]
  },
  "trace": {
    "file": "/node_modules/@nestjs/common/pipes/validation.pipe.js",
    "line": "101",
    "column": "20"
  }
}
```

## How to Protect Routes

### In Controllers

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Get('protected-endpoint')
async protectedRoute(@CurrentUser() user: any) {
  // Access user information here
  console.log('Current user:', user.email);
  return { message: 'This is protected', user: user.email };
}
```

### Getting Current User

The `@CurrentUser()` decorator provides access to the authenticated user's information:

```typescript
{
  sub: 13,           // User ID
  email: "user@example.com",
  name: "Your Name",
  iat: 1753205655,   // Issued at
  exp: 1753810455    // Expires at
}
```

## Environment Variables

Ensure these are set in your `.env` file:

```env
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=30d
```

## Best Practices Implemented

1. **Separate Access and Refresh Tokens:** Different secrets and expiration times
2. **Password Security:** Bcrypt hashing with proper salt rounds
3. **Input Validation:** Comprehensive DTO validation
4. **Error Handling:** Proper HTTP status codes and error messages
5. **Type Safety:** Full TypeScript support with interfaces
6. **Modular Design:** Clean separation of concerns
7. **Guard Protection:** Easy route protection with decorators
8. **User Context:** Access to current user in protected routes

## Testing

All endpoints have been tested and are working correctly:

- ✅ User Registration
- ✅ User Login
- ✅ Token Refresh
- ✅ Profile Retrieval
- ✅ Protected Routes
- ✅ Unauthorized Access Prevention
- ✅ Invalid Token Handling

Your JWT authentication system is now fully implemented and ready for production use!
