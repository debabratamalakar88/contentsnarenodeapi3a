
'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface User {
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

interface AuthResponse {
  user: User;
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
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
}


async function handleResponse(response: Response) {
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    if (!response.ok) {
      throw { message: `Request failed: ${response.status} ${response.statusText}` };
    }
    return {};
  }

  const responseText = await response.text();
  try {
    const data = JSON.parse(responseText);
    if (!response.ok) {
      throw data; // Throw the parsed JSON error from the API
    }
    return data;
  } catch (error) {
    console.error("API Error: Response is not valid JSON.", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });
    
    // Create a more informative error to be caught by the calling function
    const errorData = {
        message: `Request failed with status ${response.status}. The server's response was not valid JSON. Check the browser console for more details.`,
        status: response.status,
        body: responseText
    }
    throw errorData;
  }
}

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

export async function loginUser(credentials: any): Promise<AuthResponse> {
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

  if (!response.ok) {
    // Try to parse error json, but fallback if it's not there
    const errorData = await response.json().catch(() => ({ message: 'Server error during logout' }));
    throw errorData;
  }
  
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


// Client API functions

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

// Soft-deletes (archives) a client
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

// Restores a soft-deleted client
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

// Permanently deletes a client
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
