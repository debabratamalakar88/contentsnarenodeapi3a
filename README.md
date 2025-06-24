# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## API Documentation

This document outlines the API endpoints the frontend application expects for user authentication.

### User Registration

- **Endpoint:** `POST /api/register`
- **Description:** Creates a new user account.
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "created_at": "2024-08-01T12:00:00.000000Z",
      "updated_at": "2024-08-01T12:00:00.000000Z"
    },
    "token": "your_auth_token_here"
  }
  ```
- **Error Response (422 Unprocessable Entity):**
  ```json
  {
    "message": "The given data was invalid.",
    "errors": {
      "email": [
        "The email has already been taken."
      ]
    }
  }
  ```

### User Login

- **Endpoint:** `POST /api/login`
- **Description:** Authenticates a user and returns an auth token.
- **Request Body:**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "token": "your_auth_token_here"
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
    "message": "Invalid credentials"
  }
  ```

### Forgot Password

- **Endpoint:** `POST /api/forgot-password`
- **Description:** Sends a password reset link to the user's email address.
- **Request Body:**
  ```json
  {
    "email": "john.doe@example.com"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Password reset link sent."
  }
  ```
- **Error Response (422 Unprocessable Entity):**
  ```json
  {
    "message": "The given data was invalid.",
    "errors": {
      "email": [
        "We can't find a user with that email address."
      ]
    }
  }
  ```
