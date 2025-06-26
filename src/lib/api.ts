'use client';

const API_BASE_URL = 'https://narlaxsoftware.com/dev/contentsnare_api/api';

async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    throw data; // Throws the JSON error object from the API
  }
  return data;
}

export async function registerUser(userData: any) {
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

export async function loginUser(credentials: any) {
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
