

'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_ASSETS_BASE_URL = process.env.NEXT_PUBLIC_API_ASSETS_BASE_URL;

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  phone?: string | null;
  bio?: string | null;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  is_active?: boolean;
  company?: string | null;
  selected_company_id?: number | null;
  companies?: {
    id: number;
    company_name: string;
    pivot?: {
        role: string;
    };
  }[];
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
  role: string | null;
  selected_company_id: number | null;
  selected_company: Company | null;
}

interface AdminAuthResponse {
    admin: AdminProfile;
    token: string;
}

export interface Company {
    id: number;
    company_name: string;
    company_subdomain: string;
    company_logo: string | null;
    created_by: number;
    updated_by: number;
    pivot?: {
        role?: string;
    };
}

export interface Client {
  id: number;
  full_name: string;
  email: string;
  companies: string[];
  company_id?: number;
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

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string | null;
  role: 'Administrator' | 'Editor' | 'Reviewer' | 'Viewer';
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
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
  minLength?: number;
  maxLength?: number;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonType?: 'button' | 'submit';
  hideInstructions?: boolean;
  showPlaceholder?: boolean;
  showLengthValidation?: boolean;
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
  client_id: number[] | number | null;
  clients?: Client[];
  status: 'draft' | 'published' | 'completed' | 'archived' | 'scheduled';
  allow_comments: boolean;
  send_option: 'immediately' | 'scheduled';
  scheduled_at?: string | null;
  communication_mode: string;
  started_from_scratch: boolean;
  due_date: string | null;
  user_id: number;
  user?: User; 
  company_id?: number;
  company?: Company;
  created_by: number;
  updated_by?: number | null;
  created_at: string;
  updated_at: string;
  submissions_count?: number;
  deleted_at?: string | null;
}

export interface Submission {
  id: number;
  request_id: number;
  client_id: number | null;
  client_name?: string;
  client_email?: string;
  submission_code: string;
  status: 'in_progress' | 'completed';
  form_data: any;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: number;
  request_id: number;
  client_id: number;
  reminder_date: string;
  sent: boolean;
  created_at: string;
  updated_at: string;
  client: {
    id: number;
    full_name: string;
    email: string;
  };
  request: {
    id: number;
    title: string;
    request_code: string;
    created_by: number;
  };
}

export interface Comment {
  id: number;
  request_id: number;
  user_id: number;
  question_id: string;
  comment: string;
  attachments: string[];
  is_internal: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
  };
  request: {
    id: number;
    title: string;
  };
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
    }
}

export interface PaginatedRequests extends PaginatedResponse<Request> {}
export interface PaginatedUsers extends PaginatedResponse<User> {}
export interface PaginatedClients extends PaginatedResponse<Client> {}
export interface PaginatedReminders extends PaginatedResponse<Reminder> {}


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
  if (response.status === 204) {
    return {};
  }
  
  const responseText = await response.text();
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch (e) {
      errorData = { message: responseText || `Request failed with status ${response.status}` };
    }
    
    // Ensure the thrown object has a message property
    if (typeof errorData !== 'object' || errorData === null || !('message' in errorData)) {
        throw { message: responseText || 'An unknown error occurred', status: response.status };
    }

    throw errorData;
  }

  if (!responseText) {
    if (response.ok) {
      return {};
    } else {
      throw { message: `Request failed with status ${response.status}: ${response.statusText}`, status: response.status };
    }
  }

  try {
    return JSON.parse(responseText);
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
// COMPANY API
// ===================================

export async function getCompanies(token: string): Promise<Company[]> {
    const response = await fetchWithToken(`${API_BASE_URL}/api/companies`, token);
    return response.companies || [];
}

export async function getCompany(token: string, id: number): Promise<Company> {
    return fetchWithToken(`${API_BASE_URL}/api/companies/${id}`, token);
}

export async function selectCompany(token: string, company_id: number): Promise<{ message: string; role: string; token: string }> {
  return fetchWithToken(`${API_BASE_URL}/api/selectCompany`, token, {
      method: 'POST',
      body: JSON.stringify({ company_id }),
  });
}

export async function createCompany(token: string, companyData: { company_name: string, company_subdomain?: string, company_logo?: string | null }): Promise<{ message: string; selected_company_id: number }> {
    return fetchWithToken(`${API_BASE_URL}/api/createCompany`, token, {
        method: 'POST',
        body: JSON.stringify(companyData),
    });
}

export async function updateCompany(token: string, id: number, companyData: Partial<Company>): Promise<{ message: string, company: Company }> {
    return fetchWithToken(`${API_BASE_URL}/api/companies/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(companyData),
    });
}

export async function switchCompany(token: string, company_id: number): Promise<{ message: string }> {
    return fetchWithToken(`${API_BASE_URL}/api/switchCompany`, token, {
        method: 'POST',
        body: JSON.stringify({ company_id }),
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
export async function getAdminUsers(token: string, page: number = 1, search: string = '', all: boolean = false): Promise<PaginatedUsers> {
  const url = new URL(`${API_BASE_URL}/api/admin/users`);
  if (!all) {
    url.searchParams.append('page', String(page));
  } else {
    url.searchParams.append('all', 'true');
  }
  if (search) {
      url.searchParams.append('search', search);
  }
  return fetchWithToken(url.toString(), token);
}

export async function getAdminArchivedUsers(token: string, page: number = 1, search: string = ''): Promise<PaginatedUsers> {
    const url = new URL(`${API_BASE_URL}/api/admin/users/archived`);
    url.searchParams.append('page', String(page));
    if (search) {
      url.searchParams.append('search', search);
    }
    return fetchWithToken(url.toString(), token);
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

export async function toggleAdminUserStatus(token: string, id: number, isActive: boolean): Promise<User> {
  return updateAdminUser(token, id, { is_active: isActive });
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
export async function getAdminClients(token: string, page: number = 1, search: string = '', all: boolean = false): Promise<PaginatedClients> {
    const url = new URL(`${API_BASE_URL}/api/admin/clients`);
    if (!all) {
      url.searchParams.append('page', String(page));
    } else {
       url.searchParams.append('all', 'true');
    }
    if (search) {
        url.searchParams.append('search', search);
    }
    return fetchWithToken(url.toString(), token);
}

export async function getAdminArchivedClients(token: string, page: number = 1, search: string = ''): Promise<PaginatedClients> {
    const url = new URL(`${API_BASE_URL}/api/admin/clients/archived`);
    url.searchParams.append('page', String(page));
    if (search) {
        url.searchParams.append('search', search);
    }
    return fetchWithToken(url.toString(), token);
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

// --- Admin Request Management ---
interface RequestFilters {
    search?: string;
    created_by?: string;
    company_id?: string;
    client_id?: string;
    status?: string;
}

export async function getAdminAllRequests(token: string, page: number = 1, filters: RequestFilters = {}): Promise<PaginatedRequests> {
    const url = new URL(`${API_BASE_URL}/api/admin/requests`);
    url.searchParams.append('page', String(page));
    if (filters.search) url.searchParams.append('search', filters.search);
    if (filters.created_by && filters.created_by !== 'all') url.searchParams.append('created_by', filters.created_by);
    if (filters.company_id && filters.company_id !== 'all') url.searchParams.append('company_id', filters.company_id);
    if (filters.client_id) {
        if (filters.client_id === 'no-client') {
            url.searchParams.append('client_id', '');
        } else if (filters.client_id !== 'all') {
            url.searchParams.append('client_id', filters.client_id);
        }
    }
    if (filters.status && filters.status !== 'all') url.searchParams.append('status', filters.status);
    return fetchWithToken(url.toString(), token);
}
export async function getAdminArchivedRequests(token: string, page: number = 1, filters: RequestFilters = {}): Promise<PaginatedRequests> {
    const url = new URL(`${API_BASE_URL}/api/admin/requests/archived`);
    url.searchParams.append('page', String(page));
    if (filters.search) url.searchParams.append('search', filters.search);
    if (filters.created_by && filters.created_by !== 'all') url.searchParams.append('created_by', filters.created_by);
    if (filters.company_id && filters.company_id !== 'all') url.searchParams.append('company_id', filters.company_id);
    if (filters.client_id) {
        if (filters.client_id === 'no-client') {
            url.searchParams.append('client_id', '');
        } else if (filters.client_id !== 'all') {
            url.searchParams.append('client_id', filters.client_id);
        }
    }
    return fetchWithToken(url.toString(), token);
}

export async function getAdminRequest(token: string, id: number): Promise<Request> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/requests/${id}`, token);
}

export async function updateAdminRequest(token: string, id: number, data: Partial<Request>): Promise<Request> {
    return fetchWithToken(`${API_BASE_URL}/api/admin/requests/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export async function softDeleteAdminRequest(token: string, id: number): Promise<{ message: string }> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/requests/${id}`, token, { method: 'DELETE' });
}

export async function restoreAdminRequest(token: string, id: number): Promise<{ message: string }> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/requests/${id}/restore`, token, { method: 'PATCH' });
}

export async function forceDeleteAdminRequest(token: string, id: number): Promise<{ message: string }> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/requests/${id}/force`, token, { method: 'DELETE' });
}

export async function duplicateAdminRequest(token: string, id: number): Promise<Request> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/requests/${id}/duplicate`, token, { method: 'POST' });
}

export async function getAdminRequestSubmissions(token: string, requestId: number): Promise<Submission[]> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/requests/${requestId}/submissions`, token);
}

export async function getAdminSingleSubmissionForRequest(token: string, requestId: number, submissionId: number): Promise<Submission> {
  return fetchWithToken(`${API_BASE_URL}/api/admin/requests/${requestId}/submissions/${submissionId}`, token);
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

export async function getAllRequests(token: string): Promise<Request[]> {
  let allRequests: Request[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response: PaginatedRequests = await getRequests(token, page);
    allRequests = allRequests.concat(response.data);
    lastPage = response.last_page;
    page++;
  } while (page <= lastPage);

  return allRequests;
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
// TEAM MANAGEMENT API
// ===================================

export async function getTeamMembers(token: string): Promise<TeamMember[]> {
  const response = await fetchWithToken(`${API_BASE_URL}/api/teams`, token);
  return Array.isArray(response) ? response : [];
}

export async function getArchivedTeamMembers(token: string): Promise<TeamMember[]> {
    const response = await fetchWithToken(`${API_BASE_URL}/api/teams/archived`, token);
    return Array.isArray(response) ? response : [];
}

export async function createTeamMember(token: string, memberData: Partial<TeamMember>): Promise<TeamMember> {
  return fetchWithToken(`${API_BASE_URL}/api/teams`, token, {
    method: 'POST',
    body: JSON.stringify(memberData),
  });
}

export async function getTeamMember(token: string, id: number): Promise<TeamMember> {
  return fetchWithToken(`${API_BASE_URL}/api/teams/${id}`, token);
}

export async function updateTeamMember(token: string, id: number, memberData: Partial<TeamMember>): Promise<TeamMember> {
  return fetchWithToken(`${API_BASE_URL}/api/teams/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(memberData),
  });
}

export async function softDeleteTeamMember(token: string, id: number): Promise<{ message: string }> {
  return fetchWithToken(`${API_BASE_URL}/api/teams/${id}`, token, { method: 'DELETE' });
}

export async function restoreTeamMember(token: string, id: number): Promise<{ message: string }> {
  return fetchWithToken(`${API_BASE_URL}/api/teams/${id}/restore`, token, { method: 'POST' });
}

export async function forceDeleteTeamMember(token: string, id: number): Promise<{ message: string }> {
  return fetchWithToken(`${API_BASE_URL}/api/teams/${id}/force`, token, { method: 'DELETE' });
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
// COMMENTS API
// ===================================

export async function getComments(token: string, requestId: number, questionId: number): Promise<Comment[]> {
  const response = await fetchWithToken(`${API_BASE_URL}/api/requests/${requestId}/questions/${questionId}/comments`, token);
  return response.data || [];
}

export async function addComment(token: string, data: { request_id: number, question_id: number | string, comment: string }): Promise<Comment> {
  return fetchWithToken(`${API_BASE_URL}/api/request-comments`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
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
  let originalTemplate: Template | MyTemplate;
  try {
    // Try to get it as a public template first
    originalTemplate = await getTemplate(token, templateId);
  } catch (error) {
    // If it fails (e.g., 404), try getting it as a user's own template
    originalTemplate = await getMyTemplate(token, templateId);
  }

  const newTemplateData = {
    title: `(Copy) ${originalTemplate.title}`.substring(0, 255),
    description: originalTemplate.description,
    form_data: originalTemplate.form_data,
    icon: 'icon' in originalTemplate ? originalTemplate.icon : undefined, // Handle MyTemplate not having an icon
    status: 'published' as const,
  };
  
  return createMyTemplate(token, newTemplateData);
}

// ===================================
// REMINDERS API
// ===================================

export async function getReminders(token: string, page: number = 1): Promise<PaginatedReminders> {
    return fetchWithToken(`${API_BASE_URL}/api/reminders?page=${page}`, token);
}

export async function getCalendarReminders(token: string): Promise<Reminder[]> {
  return fetchWithToken(`${API_BASE_URL}/api/reminders/calendar`, token);
}

export async function deleteReminder(token: string, id: number): Promise<{ message: string }> {
    return fetchWithToken(`${API_BASE_URL}/api/reminders/${id}`, token, {
        method: 'DELETE',
    });
}
