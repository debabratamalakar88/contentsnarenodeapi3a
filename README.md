
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## API Documentation

This document outlines the API endpoints the frontend application expects for user authentication.

### User Registration

- **Endpoint:** `POST /api/register`
- **Description:** Creates a new user account and sends a verification email.
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
      "email_verified_at": null,
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
- **Description:** Authenticates a user and returns an auth token. The `email_verified_at` field is used to determine if the user has verified their email.
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
      "email": "john.doe@example.com",
      "email_verified_at": "2024-08-01T12:00:00.000000Z"
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
- **Description:** Sends a password reset link to the user's registered email.
- **Request Body:**
| Field | Type   | Required | Description                   |
|-------|--------|----------|-------------------------------|
| `email` | String | ✅ Yes   | User's registered email address |
- **Response:**
- `200 OK`: Email sent successfully  
- `422 Unprocessable Entity`: Validation error (e.g. invalid email)

### Reset Password

- **Endpoint:** `POST /api/reset-password`
- **Description:** Resets the user's password using the token from the email.
- **Request Body:**
| Field      | Type   | Required | Description                      |
|------------|--------|----------|----------------------------------|
| `email`    | String | ✅ Yes   | User's email address             |
| `token`    | String | ✅ Yes   | Token received in the reset link |
| `password` | String | ✅ Yes   | New password                     |
| `password_confirmation` | String | ✅ Yes | Must match `password`        |
- **Response:**
- `200 OK`: Password successfully reset  
- `422 Unprocessable Entity`: Validation failed  
- `400 Bad Request`: Invalid token or email

### Email Verification

#### 1. **Get Email Verification Notice**
- **Description**: Returns a message prompting the user to verify their email. This is typically handled by middleware on protected routes.
- **URL**: `/api/email/verify`
- **Method**: `GET`
- **Middleware**: `auth:sanctum`, `throttle:6,1`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
```json
{
  "message": "Email verification required."
}
```

#### 2. **Send Verification Notification**
- **Description**: Triggers the sending of a new verification email link. The frontend calls this from the "verify-email" page.
- **URL**: `/api/email/verification-notification`
- **Method**: `POST`
- **Middleware**: `auth:sanctum`, `throttle:6,1`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Responses**:
  - If already verified:
    ```json
    {
      "message": "Email already verified."
    }
    ```
  - If not verified:
    ```json
    {
      "message": "Verification link sent."
    }
    ```

#### 3. **Verify Email**
- **Description**: Verifies the user's email via the signed URL from the email. This endpoint should redirect to the frontend upon success (e.g., `${process.env.NEXT_PUBLIC_APP_FRONT_END_BASE_URL}/email-verified`).
- **URL**: `/api/email/verify/{id}/{hash}`
- **Method**: `GET`
- **Middleware**: `signed`
- **Response**: A redirect to a frontend page.
```json
{
  "message": "Email verified successfully."
}
```

### Update User Profile

- **Endpoint:** `PUT /api/updateProfile`
- **Description:** Updates the authenticated user's profile information.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body:** An object containing any of the updatable profile fields.
  ```json
  {
    "name": "John Doe Updated",
    "phone": "555-555-5555"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Profile updated successfully.",
    "user": {
        "id": 1,
        "name": "John Doe Updated",
        "email": "john.doe@example.com",
        "phone": "555-555-5555",
        "email_verified_at": "2024-08-01T12:00:00.000000Z"
    }
  }
  ```
- **Error Response (422 Unprocessable Entity):**
  ```json
  {
    "message": "The given data was invalid.",
    "errors": {
      "name": [
        "The name must be at least 2 characters."
      ]
    }
  }
  ```

### Change Password

- **Endpoint:** `POST /api/changePassword`
- **Description:** Updates the authenticated user's password.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "current_password": "old_password",
    "new_password": "new_password",
    "new_password_confirmation": "new_password"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Password changed successfully."
  }
  ```
- **Error Response (422 Unprocessable Entity):**
  ```json
  {
    "message": "The given data was invalid.",
    "errors": {
      "current_password": [
        "The current password does not match."
      ]
    }
  }
  ```

### Create New Client

- **Endpoint:** `POST /api/clients`
- **Description:** Creates a new client.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body:**
| Field          | Type             | Required | Description                     |
|----------------|------------------|----------|---------------------------------|
| `full_name`    | String           | ✅ Yes   | The client's full name.         |
| `email`        | String (Email)   | ✅ Yes   | The client's primary email.     |
| `companies`    | Array of Strings | No       | List of companies associated.   |
| `phone_number` | String           | No       | The client's phone number.      |
| `app_language` | String           | No       | Client's preferred language.    |
| `date_format`  | String           | No       | Client's preferred date format. |
| `time_zone`    | String           | No       | Client's timezone.              |
- **Success Response (201 Created):**
  ```json
  {
    "client": {
      "id": 1,
      "full_name": "Sunder Pichai",
      "email": "sunder@google.com",
      "companies": ["Google", "Alphabet"],
      "phone_number": "+91 1234567890",
      "app_language": "english",
      "date_format": "ddmmyyyy",
      "time_zone": "ist",
      "created_at": "2024-08-02T10:00:00.000000Z",
      "updated_at": "2024-08-02T10:00:00.000000Z"
    }
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
