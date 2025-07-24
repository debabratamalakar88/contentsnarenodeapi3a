

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
  creator_name?: string;
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

export interface PaginatedResponse<T> {
    data: T[];
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
    }
}

export interface PaginatedRequests extends PaginatedResponse<Request> {}


export interface TemplateCategory {
  id: number;
  title: string;
  slug: string;
  color?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  template_count?: number;
}

export interface Template {
    id: number;
    title: string;
    description: string | null;
    icon: string | null;
    status: 'draft' | 'published';
    category_id: number | null;
    form_data: Page[];
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    category?: TemplateCategory;
}

export interface MyTemplate {
    id: number;
    title: string;
    description?: string | null;
    icon?: string | null;
    status: 'draft' | 'published';
    created_by: number;
    my_template_code?: string;
    form_data?: Page[];
}

export interface PaginatedMyTemplates extends PaginatedResponse<MyTemplate> {}


export interface PaginatedTemplates extends PaginatedResponse<Template> {}
export interface PaginatedTemplateCategories extends PaginatedResponse<TemplateCategory> {}


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

async function fetchWithToken(url: string, token: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');

    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, { ...options, headers });
    return handleResponse(response);
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
  return fetchWithToken(`${API_BASE_URL}/api/logout`, token, { method: 'POST' });
}

export async function resendVerificationEmail(token: string) {
  return fetchWithToken(`${API_BASE_URL}/api/email/verification-notification`, token, { method: 'POST' });
}

export async function getProfile(token: string): Promise<{user: Profile}> {
  return fetchWithToken(`${API_BASE_URL}/api/profile`, token);
}

export async function updateProfile(token: string, profileData: Partial<Profile>) {
  return fetchWithToken(`${API_BASE_URL}/api/updateProfile`, token, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export async function changePassword(token: string, passwordData: any) {
  return fetchWithToken(`${API_BASE_URL}/api/changePassword`, token, {
    method: 'POST',
    body: JSON.stringify(passwordData),
  });
}


// ===================================
// CLIENT API
// ===================================
export async function getClients(token: string): Promise<Client[]> {
  const response = await fetchWithToken(`${API_BASE_URL}/api/clients`, token);
  return response.map((client: any) => ({ ...client, creator_name: client.creator?.name || 'Admin' }));
}

export async function getArchivedClients(token: string): Promise<Client[]> {
  return fetchWithToken(`${API_BASE_URL}/api/clients/archived`, token);
}

export async function createClient(token: string, clientData: any) {
    return fetchWithToken(`${API_BASE_URL}/api/clients`, token, {
        method: 'POST',
        body: JSON.stringify(clientData),
    });
}

export async function getClient(token: string, id: number): Promise<Client> {
    return fetchWithToken(`${API_BASE_URL}/api/clients/${id}`, token);
}

export async function updateClient(token: string, id: number, clientData: any) {
    return fetchWithToken(`${API_BASE_URL}/api/clients/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(clientData),
    });
}

export async function deleteClient(token: string, id: number) {
    return fetchWithToken(`${API_BASE_URL}/api/clients/${id}`, token, { method: 'DELETE' });
}

export async function restoreClient(token: string, id: number) {
  return fetchWithToken(`${API_BASE_URL}/api/clients/${id}/restore`, token, { method: 'POST' });
}

export async function forceDeleteClient(token: string, id: number) {
  return fetchWithToken(`${API_BASE_URL}/api/clients/${id}/force`, token, { method: 'DELETE' });
}

// ===================================
// ADMIN API
// ===================================
export async function adminLogin(credentials: any): Promise<AdminAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
}

export async function adminLogout(token: string) {
  return fetchWithToken(`${API_BASE_URL}/api/admin/logout`, token, { method: 'POST' });
}

export async function adminForgotPassword(emailData: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(emailData),
  });
  return handleResponse(response);
}

export async function adminResetPassword(data: any) {
  const response = await fetch(`${API_BASE_URL}/api/admin/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function getAdminProfile(token: string): Promise<AdminProfile> {
  const data = await fetchWithToken(`${API_BASE_URL}/api/admin/profile`, token);
  return data.admin || data;
}

export async function updateAdminProfile(token: string, profileData: Partial<AdminProfile>) {
  return fetchWithToken(`${API_BASE_URL}/api/admin/updateProfile`, token, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export async function changeAdminPassword(token: string, passwordData: any) {
  return fetchWithToken(`${API_BASE_URL}/api/admin/changePassword`, token, {
    method: 'POST',
    body: JSON.stringify(passwordData),
  });
}

// --- Admin User Management ---
export async function getAdminUsers(token: string): Promise<User[]> {
  const users = await fetchWithToken(`${API_BASE_URL}/api/admin/users`, token);
  return Array.isArray(users) ? users : [];
}

export async function getAdminArchivedUsers(token: string): Promise<User[]> {
  const users = await fetchWithToken(`${API_BASE_URL}/api/admin/users/archived`, token);
  return Array.isArray(users) ? users : [];
}

export async function getAdminUser(token: string, id: number): Promise<User> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/users/${id}`, token);
}

export async function createAdminUser(token: string, userData: any): Promise<User> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/users`, token, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function updateAdminUser(token: string, id: number, userData: any): Promise<User> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/users/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

export async function softDeleteAdminUser(token: string, id: number) {
  return fetchWithToken(`${API_BASE_URL}/api/admin/users/${id}`, token, { method: 'DELETE' });
}

export async function restoreAdminUser(token: string, id: number) {
  return fetchWithToken(`${API_BASE_URL}/api/admin/users/${id}/restore`, token, { method: 'POST' });
}

export async function forceDeleteAdminUser(token: string, id: number) {
  return fetchWithToken(`${API_BASE_URL}/api/admin/users/${id}/force`, token, { method: 'DELETE' });
}


// --- Admin Client Management ---
export async function getAdminClients(token:string): Promise<Client[]> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/clients`, token);
}

export async function getAdminArchivedClients(token:string): Promise<Client[]> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/clients/archived`, token);
}

export async function getAdminClient(token: string, id: number): Promise<Client> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/clients/${id}`, token);
}

export async function createAdminClient(token: string, clientData: any): Promise<Client> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/clients`, token, {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
}

export async function updateAdminClient(token: string, id: number, clientData: any): Promise<Client> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/clients/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(clientData),
  });
}

export async function softDeleteAdminClient(token: string, id: number) {
  return fetchWithToken(`${API_BASE_URL}/api/admin/clients/${id}`, token, { method: 'DELETE' });
}

export async function restoreAdminClient(token: string, id: number) {
  return fetchWithToken(`${API_BASE_URL}/api/admin/clients/${id}/restore`, token, { method: 'POST' });
}

export async function forceDeleteAdminClient(token: string, id: number) {
  return fetchWithToken(`${API_BASE_URL}/api/admin/clients/${id}/force`, token, { method: 'DELETE' });
}

// --- Admin Template Category Management ---
export async function getAdminTemplateCategories(token: string, search: string = ''): Promise<PaginatedTemplateCategories> {
    const url = new URL(`${API_BASE_URL}/api/admin/template-categories`);
    if (search) url.searchParams.append('search', search);
    return fetchWithToken(url.toString(), token);
}

export async function getAdminArchivedTemplateCategories(token: string): Promise<PaginatedTemplateCategories> {
    const url = new URL(`${API_BASE_URL}/api/admin/template-categories/archived`);
    return fetchWithToken(url.toString(), token);
}

export async function createAdminTemplateCategory(token: string, data: any): Promise<TemplateCategory> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/template-categories`, token, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getAdminTemplateCategory(token: string, id: number): Promise<TemplateCategory> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/template-categories/${id}`, token);
}

export async function updateAdminTemplateCategory(token: string, id: number, data: any): Promise<TemplateCategory> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/template-categories/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function softDeleteAdminTemplateCategory(token: string, id: number): Promise<{ message: string }> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/template-categories/${id}`, token, { method: 'DELETE' });
}

export async function restoreAdminTemplateCategory(token: string, id: number): Promise<{ message: string }> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/template-categories/${id}/restore`, token, { method: 'POST' });
}

export async function forceDeleteAdminTemplateCategory(token: string, id: number): Promise<{ message: string }> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/template-categories/${id}/force`, token, { method: 'DELETE' });
}

// --- Admin Template Management ---
export async function getAdminTemplates(token: string, filters: { search?: string, category?: string } = {}): Promise<PaginatedTemplates> {
    const url = new URL(`${API_BASE_URL}/api/admin/templates`);
    if (filters.search) url.searchParams.append('search', filters.search);
    if (filters.category) url.searchParams.append('category', filters.category);
    const response = await fetchWithToken(url.toString(), token);
    return response || { data: [] };
}

export async function getAdminArchivedTemplates(token: string): Promise<PaginatedTemplates> {
    const response = await fetchWithToken(`${API_BASE_URL}/api/admin/templates/archived`, token);
    return response || { data: [] };
}

export async function createAdminTemplate(token: string, data: Partial<Template>): Promise<Template> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/templates`, token, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getAdminTemplate(token: string, id: number): Promise<Template> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/templates/${id}`, token);
}

export async function updateAdminTemplate(token: string, id: number, data: Partial<Template>): Promise<Template> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/templates/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function duplicateAdminTemplate(token: string, id: number): Promise<Template> {
    const originalTemplate = await getAdminTemplate(token, id);
    const newTemplateData = {
      title: `(Copy) ${originalTemplate.title}`.substring(0, 255),
      description: originalTemplate.description,
      form_data: originalTemplate.form_data,
      category_id: originalTemplate.category_id,
      icon: originalTemplate.icon,
      status: 'draft' as const,
    };
    return createAdminTemplate(token, newTemplateData);
}

export async function softDeleteAdminTemplate(token: string, id: number): Promise<{ message: string }> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/templates/${id}`, token, { method: 'DELETE' });
}

export async function restoreAdminTemplate(token: string, id: number): Promise<{ message: string }> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/templates/${id}/restore`, token, { method: 'POST' });
}

export async function forceDeleteAdminTemplate(token: string, id: number): Promise<{ message: string }> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/templates/${id}/force`, token, { method: 'DELETE' });
}


// ===================================
// REQUEST API
// ===================================
export async function getRequests(token: string, page: number = 1): Promise<PaginatedRequests> {
  return fetchWithToken(`${API_BASE_URL}/api/requests?page=${page}`, token);
}

export async function getArchivedRequests(token: string, page: number = 1): Promise<PaginatedRequests> {
  return fetchWithToken(`${API_BASE_URL}/api/requests/archived?page=${page}`, token);
}


export async function getSharedRequest(requestCode: string): Promise<Request> {
  const response = await fetch(`${API_BASE_URL}/api/requests/share/${requestCode}`);
  return handleResponse(response);
}

export async function createRequest(token: string, requestData: any): Promise<Request> {
  return fetchWithToken(`${API_BASE_URL}/api/requests`, token, {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
}

export async function getRequest(token: string, id: number): Promise<Request> {
  return fetchWithToken(`${API_BASE_URL}/api/requests/${id}`, token);
}

export async function updateRequest(token: string, id: number, requestData: Partial<Request>): Promise<Request> {
  return fetchWithToken(`${API_BASE_URL}/api/requests/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(requestData),
  });
}

export async function softDeleteRequest(token: string, id: number): Promise<{ message: string }> {
  return fetchWithToken(`${API_BASE_URL}/api/requests/${id}`, token, { method: 'DELETE' });
}

export async function forceDeleteRequest(token: string, id: number): Promise<{ message: string }> {
  return fetchWithToken(`${API_BASE_URL}/api/requests/${id}/force`, token, { method: 'DELETE' });
}

export async function restoreRequest(token: string, id: number): Promise<{ message: string }> {
  return fetchWithToken(`${API_BASE_URL}/api/requests/${id}/restore`, token, { method: 'PATCH' });
}

export async function duplicateRequest(token: string, id: number): Promise<Request> {
  const originalRequest = await getRequest(token, id);
  const newRequestData = {
    title: `(Copy) ${originalRequest.title}`.substring(0, 255),
    description: originalRequest.description,
    form_data: originalRequest.form_data,
  };
  return createRequest(token, newRequestData);
}

// ===================================
// REQUEST SUBMISSION API
// ===================================

export async function getRequestSubmissions(token: string, requestId: number): Promise<Submission[]> {
  return fetchWithToken(`${API_BASE_URL}/api/requests/${requestId}/submissions`, token);
}

export async function getSingleSubmissionForRequest(token: string, requestId: number, submissionId: number): Promise<Submission> {
  return fetchWithToken(`${API_BASE_URL}/api/requests/${requestId}/submissions/${submissionId}`, token);
}

export async function startSubmission(requestCode: string, data: FormData): Promise<{ message: string, submission_code: string }> {
    const response = await fetch(`${API_BASE_URL}/api/requestsubmissions/${requestCode}/start`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data,
    });
    return handleResponse(response);
}

export async function saveStep(submissionCode: string, step: number | string, data: FormData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/requestsubmissions/${submissionCode}/step/${step}`, {
        method: 'POST', // Laravel expects POST for form data with file uploads, even for updates.
        headers: { 'Accept': 'application/json', 'X-HTTP-Method-Override': 'PUT' }, // Method spoofing
        body: data,
    });
    return handleResponse(response);
}

export async function submitRequest(submissionCode: string, data: FormData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/requestsubmissions/${submissionCode}/submit`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data,
    });
    return handleResponse(response);
}

export async function getSubmission(submissionCode: string): Promise<Submission> {
    const response = await fetch(`${API_BASE_URL}/api/requestsubmissions/${submissionCode}`);
    return handleResponse(response);
}

// ===================================
// TEMPLATES API (User-facing)
// ===================================

export async function getTemplateCategories(token: string): Promise<TemplateCategory[]> {
    const response = await fetchWithToken(`${API_BASE_URL}/api/templates/categories`, token);
    return Array.isArray(response) ? response : [];
}

export async function getTemplates(token: string, category?: string, search?: string): Promise<PaginatedTemplates> {
    const url = new URL(`${API_BASE_URL}/api/templates`);
    if (category) url.searchParams.append('category', category);
    if (search) url.searchParams.append('search', search);
    return fetchWithToken(url.toString(), token);
}

export async function getTemplate(token: string, id: number): Promise<Template> {
  return fetchWithToken(`${API_BASE_URL}/api/templates/${id}`, token);
}


// ===================================
// MY TEMPLATES API (User-created)
// ===================================

export async function getMyTemplates(token: string, search?: string): Promise<PaginatedMyTemplates> {
    const url = new URL(`${API_BASE_URL}/api/mytemplates`);
    if (search) url.searchParams.append('search', search);
    return fetchWithToken(url.toString(), token);
}

export async function createMyTemplate(token: string, data: Partial<MyTemplate>): Promise<MyTemplate> {
    return fetchWithToken(`${API_BASE_URL}/api/mytemplates`, token, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getMyTemplate(token: string, id: number): Promise<MyTemplate> {
    return fetchWithToken(`${API_BASE_URL}/api/mytemplates/${id}`, token);
}

export async function updateMyTemplate(token: string, id: number, data: Partial<MyTemplate>): Promise<MyTemplate> {
    return fetchWithToken(`${API_BASE_URL}/api/mytemplates/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteMyTemplate(token: string, id: number): Promise<{ message: string }> {
    return fetchWithToken(`${API_BASE_URL}/api/mytemplates/${id}`, token, { method: 'DELETE' });
}

export async function duplicateMyTemplate(token: string, templateId: number): Promise<MyTemplate> {
  // This function can duplicate either a public template or a user's own template into their "My Templates".
  // The backend should handle the logic based on the provided ID.
  const payload = { source_template_id: templateId };
  return fetchWithToken(`${API_BASE_URL}/api/mytemplates`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
