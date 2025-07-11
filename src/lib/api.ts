

'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  phone?: string | null;
  bio?: string | null;
  company?: string | null;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Profile extends User {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country_code?: string;
  country_name?: string;
  country_flag?: string;
  country_phone_code?: string;
  locale?: string;
  currency?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  language?: string;
}

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
  username?: string;
  phone?: string | null;
  profile_picture?: string | null;
  bio?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country_code?: string | null;
  country_name?: string | null;
  country_flag?: string | null;
  country_phone_code?: string | null;
  locale?: string | null;
  currency?: string | null;
  timezone?: string | null;
  date_format?: string | null;
  time_format?: string | null;
  language?: string | null;
  is_active?: boolean;
}

interface UserAuthResponse {
  user: User;
  token: string;
}

interface AdminAuthResponse {
    admin: AdminProfile;
    token: string;
}


export interface Client {
  id: number;
  full_name: string;
  email: string;
  companies: string[];
  phone_number: string | null;
  app_language: string | null;
  date_format: string | null;
  time_zone: string | null;
  profile_picture: string | null;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
}

export type QuestionType = 'text' | 'textarea' | 'file' | 'checkbox' | 'dropdown' | 'date' | 'email' | 'tel' | 'url' | 'radio' | 'formatted-text' | 'image-upload' | 'address' | 'number' | 'currency' | 'country' | 'date-range' | 'icon-selector' | 'color-picker' | 'button';

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: number;
  label:string;
  type: QuestionType;
  instructions?: string;
  placeholder?: string;
  options?: QuestionOption[];
  required?: boolean;
  defaultValue?: string;
  apiId?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonType?: 'button' | 'submit';
}

export interface Section {
  id: number;
  title: string;
  instructions?: string;
  questions: Question[];
}

export interface Page {
  id: number;
  title: string;
  instructions?: string;
  sections: Section[];
}

export interface Request {
  id: number;
  title: string;
  description: string;
  request_code: string;
  form_code: string;
  form_data: Page[];
  client_id: number[] | null;
  status: 'draft' | 'published' | 'completed' | 'archived';
  allow_comments: boolean;
  send_option: 'immediately' | 'later';
  scheduled_at?: string | null;
  communication_mode: string;
  started_from_scratch: boolean;
  due_date: string | null;
  user_id: number;
  created_by: number;
  updated_by?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: number;
  request_id: number;
  client_id: number;
  submission_code: string;
  status: 'in_progress' | 'completed';
  form_data: any;
  created_at: string;
  updated_at: string;
}

export interface PaginatedRequests {
    current_page: number;
    data: Request[];
    last_page: number;
    total: number;
}


async function handleResponse(response: Response) {
  // A 204 No Content response has no body, so we return an empty object.
  if (response.status === 204) {
    return {};
  }
  
  const responseText = await response.text();
  
  // If the response text is empty, we can also return an empty object if the status is OK.
  if (!responseText) {
    if (response.ok) {
      return {};
    } else {
      // If not ok and empty, throw a generic error.
      throw { message: `Request failed with status ${response.status}: ${response.statusText}`, status: response.status };
    }
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (error) {
    const errorMessage = `A backend communication error occurred (Status: ${response.status} ${response.statusText}). The server sent back an unexpected response, likely an HTML error page instead of JSON data.

Possible causes:
1. Is the API URL in your .env file correct and is the backend server running?
2. Is there a CORS policy error? Check the browser Console for messages.
3. Is there a server-side error? Check your Laravel logs.

The full server response has been logged to the browser console for debugging.`;

    console.error("API Error: The server returned a non-JSON response. See the response body below:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });
    
    throw { message: errorMessage, status: response.status, body: responseText };
  }

  if (!response.ok) {
    throw data;
  }

  return data;
}

// ===================================
// USER AUTHENTICATION & PROFILE
// ===================================
export async function registerUser(userData: any): Promise<{user: User; token: string}> {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
}

export async function loginUser(credentials: any): Promise<UserAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
}

export async function forgotPassword(emailData: any) {
  const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(emailData),
  });
  return handleResponse(response);
}

export async function resetPassword(data: any) {
  const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function logoutUser(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function resendVerificationEmail(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/email/verification-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function getProfile(token: string): Promise<{user: Profile}> {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function updateProfile(token: string, profileData: Partial<Profile>) {
  const response = await fetch(`${API_BASE_URL}/api/updateProfile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData)
  });
  return handleResponse(response);
}

export async function changePassword(token: string, passwordData: any) {
  const response = await fetch(`${API_BASE_URL}/api/changePassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData)
  });
  return handleResponse(response);
}


// ===================================
// CLIENT API
// ===================================
export async function getClients(token: string): Promise<Client[]> {
  const response = await fetch(`${API_BASE_URL}/api/clients`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function getArchivedClients(token: string): Promise<Client[]> {
  const response = await fetch(`${API_BASE_URL}/api/clients/archived`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function createClient(token: string, clientData: any) {
    const response = await fetch(`${API_BASE_URL}/api/clients`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
    });
    return handleResponse(response);
}

export async function getClient(token: string, id: number): Promise<Client> {
    const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse(response);
}

export async function updateClient(token: string, id: number, clientData: any) {
    const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
    });
    return handleResponse(response);
}

export async function deleteClient(token: string, id: number) {
    const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse(response);
}

export async function restoreClient(token: string, id: number) {
  const response = await fetch(`${API_BASE_URL}/api/clients/${id}/restore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function forceDeleteClient(token: string, id: number) {
  const response = await fetch(`${API_BASE_URL}/api/clients/${id}/force`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

// ===================================
// ADMIN API
// ===================================

export async function adminLogin(credentials: any): Promise<AdminAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
}

export async function adminLogout(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function adminForgotPassword(emailData: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(emailData),
  });
  return handleResponse(response);
}

export async function adminResetPassword(data: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function getAdminProfile(token: string): Promise<AdminProfile> {
  const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await handleResponse(response);
  return data.admin || data;
}

export async function updateAdminProfile(token: string, profileData: Partial<AdminProfile>) {
  const response = await fetch(`${API_BASE_URL}/api/admin/updateProfile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData)
  });
  return handleResponse(response);
}

export async function changeAdminPassword(token: string, passwordData: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/changePassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData)
  });
  return handleResponse(response);
}

// --- Admin User Management ---
export async function getAdminUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  const users = await handleResponse(response);
  return Array.isArray(users) ? users : [];
}

export async function getAdminArchivedUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/archived`, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  const users = await handleResponse(response);
  return Array.isArray(users) ? users : [];
}

export async function getAdminUser(token: string, id: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

export async function createAdminUser(token: string, userData: any): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
}

export async function updateAdminUser(token: string, id: number, userData: any): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
}

export async function softDeleteAdminUser(token: string, id: number) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

export async function restoreAdminUser(token: string, id: number) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/restore`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

export async function forceDeleteAdminUser(token: string, id: number) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/force`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}


// --- Admin Client Management ---
export async function getAdminClients(token:string): Promise<Client[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/clients`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse(response);
}

export async function getAdminArchivedClients(token:string): Promise<Client[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/clients/archived`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse(response);
}

export async function getAdminClient(token: string, id: number): Promise<Client> {
    const response = await fetch(`${API_BASE_URL}/api/admin/clients/${id}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
}

export async function createAdminClient(token: string, clientData: any): Promise<Client> {
  const response = await fetch(`${API_BASE_URL}/api/admin/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(clientData),
  });
  return handleResponse(response);
}

export async function updateAdminClient(token: string, id: number, clientData: any): Promise<Client> {
  const response = await fetch(`${API_BASE_URL}/api/admin/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(clientData),
  });
  return handleResponse(response);
}

export async function softDeleteAdminClient(token: string, id: number) {
  const response = await fetch(`${API_BASE_URL}/api/admin/clients/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

export async function restoreAdminClient(token: string, id: number) {
  const response = await fetch(`${API_BASE_URL}/api/admin/clients/${id}/restore`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

export async function forceDeleteAdminClient(token: string, id: number) {
  const response = await fetch(`${API_BASE_URL}/api/admin/clients/${id}/force`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

// ===================================
// REQUEST API
// ===================================
export async function getRequests(token: string, page: number = 1): Promise<PaginatedRequests> {
  const response = await fetch(`${API_BASE_URL}/api/requests?page=${page}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function getArchivedRequests(token: string, page: number = 1): Promise<PaginatedRequests> {
  // Assuming this endpoint exists based on other resource patterns
  const response = await fetch(`${API_BASE_URL}/api/requests/archived?page=${page}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}


export async function getSharedRequest(requestCode: string): Promise<Request> {
  const response = await fetch(`${API_BASE_URL}/api/requests/share/${requestCode}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  return handleResponse(response);
}

export async function createRequest(token: string, requestData: any): Promise<Request> {
  const response = await fetch(`${API_BASE_URL}/api/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });
  return handleResponse(response);
}

export async function getRequest(token: string, id: number): Promise<Request> {
  const response = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function updateRequest(token: string, id: number, requestData: Partial<Request>): Promise<Request> {
  const response = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });
  return handleResponse(response);
}

export async function softDeleteRequest(token: string, id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function forceDeleteRequest(token: string, id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/requests/${id}/force`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function restoreRequest(token: string, id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/requests/${id}/restore`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function duplicateRequest(token: string, id: number): Promise<Request> {
  // 1. Fetch the original request
  const originalRequest = await getRequest(token, id);

  // 2. Prepare the new request data for creation, adhering to the create endpoint's expected payload.
  const newRequestData = {
    title: `(Copy) ${originalRequest.title}`.substring(0, 255), // Truncate to prevent DB errors
    description: originalRequest.description,
    form_data: originalRequest.form_data,
  };
  
  // 3. Create the new request using the existing create endpoint.
  // The backend will set the status to 'draft' and generate new IDs.
  return createRequest(token, newRequestData);
}

// ===================================
// REQUEST SUBMISSION API
// ===================================

export async function getRequestSubmissions(token: string, requestId: number): Promise<Submission[]> {
  const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}/submissions`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
      },
  });
  return handleResponse(response);
}

export async function startSubmission(requestCode: string, data: any): Promise<{ message: string, submission_code: string }> {
    const response = await fetch(`${API_BASE_URL}/api/requestsubmissions/${requestCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function saveStep(submissionCode: string, step: number | string, data: any): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/requestsubmissions/${submissionCode}/step/${step}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function submitRequest(submissionCode: string, data: any): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/requestsubmissions/${submissionCode}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function getSubmission(submissionCode: string): Promise<{ form_data: any, status: string }> {
    const response = await fetch(`${API_BASE_URL}/api/requestsubmissions/${submissionCode}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    });
    return handleResponse(response);
}

