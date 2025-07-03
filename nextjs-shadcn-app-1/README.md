
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

### 🧾 **Client Resource API Documentation**

**Base URL:** `/api/clients`  
**Auth:** Requires Bearer token via `auth:sanctum` middleware

---

#### `GET /clients`

Retrieve a list of active clients for the authenticated user.

**Response:** `200 OK` - Returns an array of client objects.
```json
[
  {
    "id": 1,
    "full_name": "Sunder Pichai",
    "email": "sunder@google.com"
  }
]
```

---

#### `GET /clients/archived`

Retrieve a list of archived (soft-deleted) clients for the authenticated user.

**Response:** `200 OK` - Returns an array of soft-deleted client objects.

---

#### `POST /clients`

Create a new client.

**Request Body:**
```json
{
  "full_name": "Sunder Pichai",
  "email": "sunder@google.com",
  "companies": ["Google", "Alphabet"],
  "phone_number": "+91 1234567890",
  "app_language": "english",
  "date_format": "ddmmyyyy",
  "time_zone": "ist",
  "profile_picture": "profile.jpg",
  "is_active": true
}
```

**Response:** `201 Created` - Returns the created client object.

---

#### `GET /clients/{id}`

Retrieve a specific client by ID.

**Response:** `200 OK` - Returns the client object or `404 Not Found`.

---

#### `PUT /clients/{id}`

Update an existing client.

**Request Body:** Partial or full updates are accepted.
```json
{
  "full_name": "Sundar Pichai",
  "phone_number": "+91 9876543210"
}
```

**Response:** `200 OK` - Returns the updated client object.

---

#### `DELETE /clients/{id}`

Soft-delete (archive) a client.

- **Behavior:** Sets `is_deleted = true`, populates `deleted_by`, and sets `deleted_at`.
- **Response:** `200 OK`
  ```json
  { "message": "Client archived successfully." }
  ```

---

#### `POST /clients/{id}/restore`

Restore a soft-deleted client.

- **Response:** `200 OK`
  ```json
  { "message": "Client restored successfully." }
  ```

---

#### `DELETE /clients/{id}/force`

Permanently delete a client from the database.

- **Behavior:** Requires the client to be soft-deleted first.
- **Response:** `200 OK`
  ```json
  { "message": "Client permanently deleted." }
  ```

---

## 🛡️ System Admin API Documentation

This section outlines API endpoints specifically for the System Admin panel. All endpoints require an admin-level Bearer token for authorization and are prefixed with `/api/admin`.

### Admin Login

- **Endpoint:** `POST /api/admin/login`
- **Description:** Authenticates a system administrator. The backend should differentiate based on user role to grant admin access.
- **Request Body & Response:** Same as [User Login](#user-login), but the endpoint is different.

---

### User Management Resource

**Base URL:** `/api/admin/users`  
**Auth:** Requires admin Bearer token.

#### `GET /api/admin/users`

Retrieve a list of all registered users.

**Response:** `200 OK` - Returns an array of user objects.
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "email_verified_at": "2024-08-01T12:00:00.000000Z",
    "created_at": "2024-08-01T10:00:00.000000Z"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "email_verified_at": null,
    "created_at": "2024-08-02T11:30:00.000000Z"
  }
]
```

#### `GET /api/admin/users/{id}`

Retrieve a specific user by ID.

**Response:** `200 OK` - Returns the user object or `404 Not Found`.

#### `PUT /api/admin/users/{id}`

Update a user's details (e.g., name, status).

**Request Body:**
```json
{
  "name": "Johnathan Doe",
  "is_active": false
}
```

**Response:** `200 OK` - Returns the updated user object.

#### `DELETE /api/admin/users/{id}`

Deactivate or soft-delete a user account.

**Response:** `200 OK`
```json
{ "message": "User account deactivated successfully." }
```

---

### Global Client Management (Admin)

**Base URL:** `/api/admin/clients`  
**Auth:** Requires admin Bearer token.

When an admin is authenticated, these endpoints provide access to clients across *all* user accounts.

- `GET /api/admin/clients`: Returns all active clients from all users.
- `GET /api/admin/clients/archived`: Returns all archived clients from all users.

The request/response formats for these endpoints mirror the [Client Resource API Documentation](#-client-resource-api-documentation), but the data scope is global.
