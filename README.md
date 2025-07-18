

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

---
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

---

## 📝 Request Resource API Documentation

**Base URL:** `/api/requests`  
**Auth:** Requires Bearer token via `auth:sanctum` middleware

This section outlines the API for managing the multi-step request forms.

---

#### `POST /requests`

Create a new request form. The entire structure of the form, including pages, sections, and questions, is sent in a single `form_data` JSON object.

**Request Body:**
```json
{
  "title": "New Client Onboarding",
  "description": "Please provide all necessary documents and information.",
  "form_data": [
    {
      "title": "1. Personal Information",
      "instructions": "Please enter your personal details.",
      "sections": [
        {
          "title": "1.1 Basic Info",
          "instructions": "",
          "questions": [
            {
              "label": "Full Name",
              "type": "text",
              "instructions": "Enter your full legal name.",
              "placeholder": "John Doe",
              "required": true,
              "api_id": "full_name"
            },
            {
              "label": "Date of Birth",
              "type": "date",
              "instructions": null,
              "placeholder": null,
              "required": true,
              "api_id": "date_of_birth"
            }
          ]
        }
      ]
    },
    {
      "title": "2. File Uploads",
      "instructions": "Upload the required documents.",
      "sections": [
        {
          "title": "2.1 Documents",
          "instructions": "Upload a clear copy of your driver's license.",
          "questions": [
            {
              "label": "Driver's License",
              "type": "file",
              "instructions": null,
              "placeholder": null,
              "required": true,
              "api_id": "drivers_license"
            },
            {
              "label": "Services Needed",
              "type": "dropdown",
              "instructions": "Select the service you are interested in.",
              "placeholder": "Select a service...",
              "required": true,
              "api_id": "service_needed",
              "options": [
                {
                  "label": "Bookkeeping",
                  "value": "bookkeeping"
                },
                {
                  "label": "Tax Preparation",
                  "value": "tax_prep"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Success Response (`201 Created`):** Returns the newly created request object, including the server-generated `id`.

```json
{
  "id": 123,
  "title": "New Client Onboarding",
  "description": "Please provide all necessary documents and information.",
  "form_data": [
    { ... }
  ],
  "status": "draft",
  "created_at": "2024-08-10T12:00:00.000000Z",
  "updated_at": "2024-08-10T12:00:00.000000Z"
}
```

**Error Response (`422 Unprocessable Entity`):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": ["The title field is required."],
    "form_data.0.sections.0.questions.0.label": ["The question label is required."]
  }
}
```

---

#### `GET /requests`

Retrieve a list of all requests created by the authenticated user.

**Response (`200 OK`):**
```json
[
  {
    "id": 123,
    "title": "New Client Onboarding",
    "status": "draft",
    "created_at": "2024-08-10T12:00:00.000000Z"
  },
  {
    "id": 124,
    "title": "Q3 Marketing Assets",
    "status": "published",
    "created_at": "2024-08-09T10:30:00.000000Z"
  }
]
```

---

#### `GET /requests/{id}`

Retrieve a single request by its ID.

**Response (`200 OK`):** Returns the full request object, same format as the `POST` success response. Returns `404 Not Found` if the ID does not exist or does not belong to the user.

---

#### `PUT /requests/{id}`

Update an existing request. The request body should contain the complete, updated request object.

**Request Body:** Same format as the `POST` request.

**Success Response (`200 OK`):** Returns the updated request object.

---

#### `DELETE /requests/{id}`

Delete a request.

**Success Response (`204 No Content` or `200 OK` with message):**
```json
{
  "message": "Request deleted successfully."
}
```

---

### 🎨 **Template Gallery API Documentation**

**Base URL:** `/api/templates`  
**Auth:** Requires Bearer token via `auth:sanctum` middleware

---

#### `GET /templates/categories`

Retrieve a list of all available template categories.

**Response:** `200 OK` - Returns an array of category objects.
```json
[
    {
        "id": 1,
        "name": "Accounting",
        "slug": "accounting",
        "template_count": 13
    },
    {
        "id": 2,
        "name": "Bookkeeping",
        "slug": "bookkeeping",
        "template_count": 4
    }
]
```

---

#### `GET /templates`

Retrieve a list of templates. This endpoint supports filtering and searching.

**Query Parameters:**

- `category` (string, optional): Filter templates by category slug (e.g., `?category=accounting`).
- `search` (string, optional): Search templates by a keyword in their title or description (e.g., `?search=onboarding`).

**Response:** `200 OK` - Returns an array of template objects.
```json
[
    {
        "id": 1,
        "title": "ATO Client-agent Linking",
        "description": "This template walks clients through the steps to link you as their authorised agent...",
        "icon": "link-2",
        "category": {
            "id": 1,
            "name": "Accounting",
            "slug": "accounting"
        },
        "form_data": [
            // The full form_data structure, same as a request object
        ]
    }
]
```
---

### 📘 **Template Categories API Documentation (Admin)**

**Base URL:** `/api/admin/template-categories`  
**Auth:** Required (Admin Bearer token via `auth:sanctum`)

---

#### 📍 `GET /template-categories`

Fetch a paginated list of template categories, optionally searchable by `title`.

**Query Parameters:**
- `search` (string, optional)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "title": "Accounting",
      "slug": "accounting",
      "color": "#f97316",
      "description": "Templates related to financial accounting",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 2,
    "total": 20
  }
}
```

---

#### 🧾 `POST /template-categories`

Create a new template category.

**Request Body:**
```json
{
  "title": "Bookkeeping",
  "color": "#0ea5e9",
  "description": "Basic bookkeeping templates"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "title": "Bookkeeping",
  "slug": "bookkeeping",
  "color": "#0ea5e9",
  "description": "Basic bookkeeping templates",
  ...
}
```

---

#### 🔍 `GET /template-categories/{id}`

Retrieve details of a single category by ID.

**Response:** `200 OK`

---

#### ✏️ `PUT /template-categories/{id}`

Update an existing category.

**Request Body (partial allowed):**
```json
{
  "title": "Client Onboarding",
  "color": "#8b5cf6"
}
```

**Response:** `200 OK`

---

#### 🗃 `DELETE /template-categories/{id}`

Soft delete a category (archive).

**Response:** `200 OK`
```json
{ "message": "Category archived successfully." }
```

---

#### 🧙‍♀️ `GET /template-categories/archived`

List all soft-deleted (archived) categories.

**Response:** `200 OK` - Returns an array of category objects.

---

#### 🪄 `POST /template-categories/{id}/restore`

Restore a previously archived category.

**Response:** `200 OK`
```json
{ "message": "Category restored successfully." }
```

---

#### 💣 `DELETE /template-categories/{id}/force`

Permanently delete a soft-deleted category.

**Response:** `200 OK`
```json
{ "message": "Category permanently deleted." }
```


---

### 💾 **Database Schema for Requests**

For storing the multi-step request forms, a single `requests` table is recommended. The dynamic structure of the form (pages, sections, questions) is best stored in a `JSON` column. This approach simplifies development and aligns with the API structure.

**`requests` Table SQL Definition:**
```sql
CREATE TABLE requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    form_data JSON NOT NULL,
    status ENUM('draft', 'published', 'completed', 'archived') NOT NULL DEFAULT 'draft',
    due_date DATE NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_requests_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**`form_data` JSON Structure:**

The `form_data` column will store an array of page objects, where each object has the following structure:

- **Page Object:**
  - `title`: String
  - `instructions`: String (optional)
  - `sections`: Array of Section Objects
- **Section Object:**
  - `title`: String
  - `instructions`: String (optional)
  - `questions`: Array of Question Objects
- **Question Object:**
  - `label`: String
  - `type`: String (e.g., 'text', 'file', 'dropdown')
  - `instructions`: String (optional)
  - `placeholder`: String (optional)
  - `required`: Boolean
  - `api_id`: String (unique identifier for the question)
  - `options`: Array of Option Objects (for 'dropdown', 'radio', etc.)
- **Option Object:**
  - `label`: String
  - `value`: String
```
