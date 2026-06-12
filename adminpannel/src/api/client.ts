const API_BASE = '/api/v1/admin';

const MOCK_TOKEN = 'mock_admin_token_2024';

function isMockEnabled(): boolean {
  return localStorage.getItem('admin_mock') === 'true';
}

const mockDb: Array<{
  id: string;
  username: string;
  password: string;
  displayName: string | null;
  isSuperAdmin: boolean;
  permissions: string[];
  createdAt: string;
}> = [
  {
    id: 'mock-super-001',
    username: 'superadmin',
    password: 'Lucifer@25255225',
    displayName: 'Super Admin',
    isSuperAdmin: true,
    permissions: ['dashboard', 'admins', 'users', 'subjects', 'experiences', 'requests', 'settings'],
    createdAt: new Date().toISOString(),
  },
];

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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function mockRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};
  const token = getToken();
  const isLogin = method === 'POST' && endpoint === '/login';

  if (!token && !isLogin) throw new Error('No token');

  await delay();

  if (isLogin) {
    const user = mockDb.find((a) => a.username === body.username && a.password === body.password);
    if (!user) throw new Error('Invalid username or password');
    return {
      admin: { id: user.id, username: user.username, displayName: user.displayName, isSuperAdmin: user.isSuperAdmin, permissions: user.permissions },
      tokens: { accessToken: MOCK_TOKEN, refreshToken: MOCK_TOKEN },
    } as T;
  }

  if (method === 'GET' && endpoint === '/me') {
    const u = mockDb[0];
    return { id: u.id, username: u.username, displayName: u.displayName, isSuperAdmin: u.isSuperAdmin, permissions: u.permissions } as T;
  }

  if (method === 'GET' && endpoint === '/dashboard') {
    return {
      totalUsers: 42, totalSubjects: 15, totalExperiences: 128, totalRequests: 37, totalAdmins: mockDb.length,
      recentUsers: [
        { id: '1', username: 'alirez_a', email: 'alireza@test.com', role: 'USER', createdAt: new Date().toISOString() },
        { id: '2', username: 'maryam_87', email: 'maryam@test.com', role: 'EXPERT', createdAt: new Date().toISOString() },
      ],
      recentSubjects: [
        { id: '1', title: 'React.js', slug: 'react-js', experienceCount: 24, createdAt: new Date().toISOString() },
        { id: '2', title: 'TypeScript', slug: 'typescript', experienceCount: 18, createdAt: new Date().toISOString() },
      ],
      recentExperiences: [
        { id: '1', content: 'Great experience with React...', rating: 5, authorId: '1', subjectId: '1', createdAt: new Date().toISOString() },
      ],
      recentRequests: [
        { id: '1', title: 'Add GraphQL support', status: 'open', votes: 12, createdAt: new Date().toISOString() },
      ],
    } as T;
  }

  if (method === 'GET' && endpoint === '/admins') {
    return mockDb.map(({ password: _, ...rest }) => rest) as T;
  }

  if (method === 'GET' && endpoint.startsWith('/admins/')) {
    const id = endpoint.replace('/admins/', '');
    const user = mockDb.find((a) => a.id === id);
    if (!user) throw new Error('Admin not found');
    const { password: _, ...rest } = user;
    return rest as T;
  }

  if (method === 'POST' && endpoint === '/admins') {
    const newAdmin = { id: `mock-${Date.now()}`, username: body.username, password: body.password, displayName: body.displayName || null, isSuperAdmin: false, permissions: body.permissions || [], createdAt: new Date().toISOString() };
    mockDb.push(newAdmin);
    const { password: _, ...rest } = newAdmin;
    return rest as T;
  }

  if ((method === 'PATCH' || method === 'PUT') && endpoint.startsWith('/admins/')) {
    const id = endpoint.replace('/admins/', '');
    const idx = mockDb.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Admin not found');
    if (mockDb[idx].isSuperAdmin) throw new Error('Cannot modify superadmin');
    Object.assign(mockDb[idx], body);
    if (body.password) mockDb[idx].password = body.password;
    const { password: _, ...rest } = mockDb[idx];
    return rest as T;
  }

  if (method === 'DELETE' && endpoint.startsWith('/admins/')) {
    const id = endpoint.replace('/admins/', '');
    const idx = mockDb.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Admin not found');
    if (mockDb[idx].isSuperAdmin) throw new Error('Cannot delete superadmin');
    mockDb.splice(idx, 1);
    return null as T;
  }

  if (method === 'GET' && endpoint.startsWith('/users')) {
    return { users: [], total: 0 } as T;
  }
  if (method === 'GET' && endpoint.startsWith('/subjects')) {
    return { subjects: [], total: 0 } as T;
  }
  if (method === 'GET' && endpoint.startsWith('/experiences')) {
    return { experiences: [], total: 0 } as T;
  }
  if (method === 'GET' && endpoint.startsWith('/requests')) {
    return { requests: [], total: 0 } as T;
  }

  throw new Error('Not found in mock');
}

function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (isMockEnabled()) return mockRequest<T>(endpoint, options);
  return request<T>(endpoint, options);
}

export const api = {
  setTokens, clearTokens, getToken,

  login: (username: string, password: string) =>
    apiCall<{ admin: { id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[] }; tokens: { accessToken: string; refreshToken: string } }>(
      '/login', { method: 'POST', body: JSON.stringify({ username, password }) },
    ),

  getProfile: () =>
    apiCall<{ id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[] }>('/me'),

  getDashboard: () =>
    apiCall<{
      totalUsers: number; totalSubjects: number; totalExperiences: number; totalRequests: number; totalAdmins: number;
      recentUsers: Array<{ id: string; username: string; email: string; role: string; createdAt: string }>;
      recentSubjects: Array<{ id: string; title: string; slug: string; experienceCount: number; createdAt: string }>;
      recentExperiences: Array<{ id: string; content: string; rating: number; authorId: string; subjectId: string; createdAt: string }>;
      recentRequests: Array<{ id: string; title: string; status: string; votes: number; createdAt: string }>;
    }>('/dashboard'),

  getAllAdmins: () =>
    apiCall<Array<{ id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[]; createdAt: string }>>('/admins'),

  getAdmin: (id: string) =>
    apiCall<{ id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[] }>(`/admins/${id}`),

  createAdmin: (data: { username: string; password: string; displayName?: string | null; permissions: string[] }) =>
    apiCall<{ id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[] }>(
      '/admins', { method: 'POST', body: JSON.stringify(data) },
    ),

  updateAdmin: (id: string, data: { username?: string; password?: string; displayName?: string | null; permissions?: string[] }) =>
    apiCall<{ id: string; username: string; displayName: string | null; isSuperAdmin: boolean; permissions: string[] }>(
      `/admins/${id}`, { method: 'PATCH', body: JSON.stringify(data) },
    ),

  deleteAdmin: (id: string) =>
    apiCall<null>(`/admins/${id}`, { method: 'DELETE' }),

  getAllUsers: (params: { page?: number; limit?: number; search?: string; role?: string } = {}) =>
    apiCall<{ users: Array<Record<string, unknown>>; total: number }>(
      `/users?page=${params.page || 1}&limit=${params.limit || 20}${params.search ? `&search=${params.search}` : ''}${params.role ? `&role=${params.role}` : ''}`,
    ),

  getUser: (id: string) =>
    apiCall<Record<string, unknown>>(`/users/${id}`),

  updateUser: (id: string, data: { role?: string; displayName?: string }) =>
    apiCall<Record<string, unknown>>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteUser: (id: string) =>
    apiCall<null>(`/users/${id}`, { method: 'DELETE' }),

  getAllSubjects: (params: { page?: number; limit?: number; search?: string; category?: string } = {}) =>
    apiCall<{ subjects: Array<Record<string, unknown>>; total: number }>(
      `/subjects?page=${params.page || 1}&limit=${params.limit || 20}${params.search ? `&search=${params.search}` : ''}${params.category ? `&category=${params.category}` : ''}`,
    ),

  createSubject: (data: { title: string; slug: string; description?: string; category?: string; icon?: string }) =>
    apiCall<Record<string, unknown>>('/subjects', { method: 'POST', body: JSON.stringify(data) }),

  updateSubject: (id: string, data: { title?: string; slug?: string; description?: string; category?: string; icon?: string }) =>
    apiCall<Record<string, unknown>>(`/subjects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteSubject: (id: string) =>
    apiCall<null>(`/subjects/${id}`, { method: 'DELETE' }),

  getAllExperiences: (params: { page?: number; limit?: number; subjectId?: string; authorId?: string; minRating?: number } = {}) =>
    apiCall<{ experiences: Array<Record<string, unknown>>; total: number }>(
      `/experiences?page=${params.page || 1}&limit=${params.limit || 20}${params.subjectId ? `&subjectId=${params.subjectId}` : ''}${params.authorId ? `&authorId=${params.authorId}` : ''}${params.minRating ? `&minRating=${params.minRating}` : ''}`,
    ),

  getExperience: (id: string) =>
    apiCall<Record<string, unknown>>(`/experiences/${id}`),

  deleteExperience: (id: string) =>
    apiCall<null>(`/experiences/${id}`, { method: 'DELETE' }),

  getAllRequests: (params: { page?: number; limit?: number; status?: string } = {}) =>
    apiCall<{ requests: Array<Record<string, unknown>>; total: number }>(
      `/requests?page=${params.page || 1}&limit=${params.limit || 20}${params.status ? `&status=${params.status}` : ''}`,
    ),

  updateRequestStatus: (id: string, status: string) =>
    apiCall<Record<string, unknown>>(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  deleteRequest: (id: string) =>
    apiCall<null>(`/requests/${id}`, { method: 'DELETE' }),
};
