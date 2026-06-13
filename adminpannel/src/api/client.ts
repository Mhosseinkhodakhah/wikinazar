const API_BASE = import.meta.env.VITE_API_URL || '/api/v1/admin';

function getToken(): string | null {
  return localStorage.getItem('admin_access_token');
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('admin_access_token', accessToken);
  localStorage.setItem('admin_refresh_token', refreshToken);
}

function clearTokens(): void {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
}

type RequestOptions = RequestInit & { skipAuth?: boolean };

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const { skipAuth: _, ...fetchOptions } = options;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...fetchOptions, headers });

  if (res.status === 401) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

export const api = {
  setTokens,
  clearTokens,
  getToken,

  login: (username: string, password: string) =>
    request<{
      admin: { id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[] };
      tokens: { accessToken: string; refreshToken: string };
    }>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    }),

  getProfile: () =>
    request<{ id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[] }>('/me'),

  getDashboard: () =>
    request<{
      totalUsers: number; totalSubjects: number; totalExperiences: number; totalRequests: number; totalAdmins: number;
      recentUsers: Array<{ id: string; username: string; email: string; role: string; createdAt: string }>;
      recentSubjects: Array<{ id: string; title: string; slug: string; experienceCount: number; createdAt: string }>;
      recentExperiences: Array<{ id: string; content: string; rating: number; authorId: string; subjectId: string; createdAt: string }>;
      recentRequests: Array<{ id: string; title: string; status: string; votes: number; createdAt: string }>;
    }>('/dashboard'),

  getAllAdmins: () =>
    request<Array<{ id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[]; createdAt: string }>>('/admins'),

  getAdmin: (id: string) =>
    request<{ id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[] }>(`/admins/${id}`),

  createAdmin: (data: { username: string; password: string; displayName?: string | null; permissions: string[] }) =>
    request<{ id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[] }>('/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAdmin: (id: string, data: { username?: string; password?: string; displayName?: string | null; permissions?: string[] }) =>
    request<{ id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[] }>(`/admins/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteAdmin: (id: string) =>
    request<null>(`/admins/${id}`, { method: 'DELETE' }),

  getAllUsers: (params: { page?: number; limit?: number; search?: string; role?: string } = {}) =>
    request<{ users: Array<Record<string, unknown>>; total: number }>(
      `/users?page=${params.page || 1}&limit=${params.limit || 20}${params.search ? `&search=${encodeURIComponent(params.search)}` : ''}${params.role ? `&role=${params.role}` : ''}`,
    ),

  getUser: (id: string) =>
    request<Record<string, unknown>>(`/users/${id}`),

  updateUser: (id: string, data: { role?: string; displayName?: string }) =>
    request<Record<string, unknown>>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteUser: (id: string) =>
    request<null>(`/users/${id}`, { method: 'DELETE' }),

  getAllSubjects: (params: { page?: number; limit?: number; search?: string; category?: string } = {}) =>
    request<{ subjects: Array<Record<string, unknown>>; total: number }>(
      `/subjects?page=${params.page || 1}&limit=${params.limit || 20}${params.search ? `&search=${encodeURIComponent(params.search)}` : ''}${params.category ? `&category=${encodeURIComponent(params.category)}` : ''}`,
    ),

  createSubject: (data: { title: string; slug: string; description?: string; category?: string; icon?: string }) =>
    request<Record<string, unknown>>('/subjects', { method: 'POST', body: JSON.stringify(data) }),

  updateSubject: (id: string, data: { title?: string; slug?: string; description?: string; category?: string; icon?: string }) =>
    request<Record<string, unknown>>(`/subjects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteSubject: (id: string) =>
    request<null>(`/subjects/${id}`, { method: 'DELETE' }),

  getAllExperiences: (params: { page?: number; limit?: number; subjectId?: string; authorId?: string; minRating?: number } = {}) =>
    request<{ experiences: Array<Record<string, unknown>>; total: number }>(
      `/experiences?page=${params.page || 1}&limit=${params.limit || 20}${params.subjectId ? `&subjectId=${params.subjectId}` : ''}${params.authorId ? `&authorId=${params.authorId}` : ''}${params.minRating ? `&minRating=${params.minRating}` : ''}`,
    ),

  getExperience: (id: string) =>
    request<Record<string, unknown>>(`/experiences/${id}`),

  deleteExperience: (id: string) =>
    request<null>(`/experiences/${id}`, { method: 'DELETE' }),

  getAllRequests: (params: { page?: number; limit?: number; status?: string } = {}) =>
    request<{ requests: Array<Record<string, unknown>>; total: number }>(
      `/requests?page=${params.page || 1}&limit=${params.limit || 20}${params.status ? `&status=${params.status}` : ''}`,
    ),

  updateRequestStatus: (id: string, status: string) =>
    request<Record<string, unknown>>(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  deleteRequest: (id: string) =>
    request<null>(`/requests/${id}`, { method: 'DELETE' }),
};
