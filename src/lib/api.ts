

'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Profile extends User {
  phone?: string;
  bio?: string;
  company?: string;
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
}

interface UserAuthResponse {
  user: User;
  token: string;
}

interface AdminAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
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
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
}


async function handleResponse(response: Response) {
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    if (!response.ok) {
      throw { message: `Request failed: ${response.status} ${response.statusText}`, status: response.status };
    }
    return {};
  }

  const responseText = await response.text();
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

export async function getAdminProfile(token: string): Promise<AdminProfile> {
  const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
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

export async function getAdminUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

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
