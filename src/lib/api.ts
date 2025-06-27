
'use client';

const API_BASE_URL = 'http://localhost/projects/laravel/laravel12/contentsnare_api/api';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}


async function handleResponse(response: Response) {
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {};
  }
  const data = await response.json();
  if (!response.ok) {
    throw data; // Throws the JSON error object from the API
  }
  return data;
}

export async function registerUser(userData: any): Promise<{user: User; token: string}> {
  const response = await fetch(`${API_BASE_URL}/register`, {
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
  const response = await fetch(`${API_BASE_URL}/login`, {
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
  const response = await fetch(`${API_BASE_URL}/forgot-password`, {
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
  const response = await fetch(`${API_BASE_URL}/reset-password`, {
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
  const response = await fetch(`${API_BASE_URL}/logout`, {
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
  const response = await fetch(`${API_BASE_URL}/email/verification-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}
