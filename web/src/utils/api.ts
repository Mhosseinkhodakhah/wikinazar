const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

let token: string | null = null;

export function setTokens(access: string, refresh: string) {
  token = access;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }
}

export function clearTokens() {
  token = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export function loadTokens() {
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }
}

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
}

export function getToken(): string | null {
  return token;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      json.error?.message || `Request failed with status ${res.status}`,
    );
  }

  return json.data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{
      user: UserDTO;
      tokens: { accessToken: string; refreshToken: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
  }) =>
    request<{
      user: UserDTO;
      tokens: { accessToken: string; refreshToken: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => request<UserDTO>('/auth/profile'),

  refreshToken: () =>
    request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
    }),

  // Subjects
  getSubjects: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    const qs = searchParams.toString();
    return request<{
      subjects: SubjectDTO[];
      total: number;
      page: number;
      limit: number;
    }>(`/subjects${qs ? `?${qs}` : ''}`);
  },

  getSubjectBySlug: (slug: string) =>
    request<SubjectDTO>(`/subjects/slug/${slug}`),

  getSubjectById: (id: string) => request<SubjectDTO>(`/subjects/${id}`),

  createSubject: (data: {
    title: string;
    description?: string;
    category?: string;
    icon?: string;
  }) =>
    request<SubjectDTO>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Experiences
  getExperiences: (params?: {
    page?: number;
    limit?: number;
    subjectId?: string;
    authorId?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.subjectId) searchParams.set('subjectId', params.subjectId);
    if (params?.authorId) searchParams.set('authorId', params.authorId);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    const qs = searchParams.toString();
    return request<{
      experiences: ExperienceDTO[];
      total: number;
      page: number;
      limit: number;
    }>(`/experiences${qs ? `?${qs}` : ''}`);
  },

  getExperienceById: (id: string) =>
    request<ExperienceDTO>(`/experiences/${id}`),

  createExperience: (data: {
    content: string;
    rating: number;
    subjectId: string;
  }) =>
    request<ExperienceDTO>('/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateExperience: (id: string, data: { content?: string; rating?: number }) =>
    request<ExperienceDTO>(`/experiences/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteExperience: (id: string) =>
    request<void>(`/experiences/${id}`, { method: 'DELETE' }),

  likeExperience: (id: string) =>
    request<{ likes: number }>(`/experiences/${id}/like`, { method: 'POST' }),

  getSubjectStats: (subjectId: string) =>
    request<{ averageRating: number; totalExperiences: number }>(
      `/experiences/stats/${subjectId}`,
    ),

  // Requests
  getRequests: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    const qs = searchParams.toString();
    return request<{
      requests: RequestDTO[];
      total: number;
      page: number;
      limit: number;
    }>(`/requests${qs ? `?${qs}` : ''}`);
  },

  createRequest: (data: { title: string; description?: string }) =>
    request<RequestDTO>('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  voteRequest: (id: string) =>
    request<{ votes: number }>(`/requests/${id}/vote`, { method: 'POST' }),

  updateRequestStatus: (id: string, status: string) =>
    request<RequestDTO>(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Dashboard
  getDashboard: (limit?: number) =>
    request<DashboardDTO>(`/dashboard${limit ? `?limit=${limit}` : ''}`),
};

// Types matching backend responses
export interface UserDTO {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'expert';
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface SubjectDTO {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  experienceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceDTO {
  id: string;
  content: string;
  rating: number;
  likes: number;
  authorId: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  subject?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface RequestDTO {
  id: string;
  title: string;
  description: string | null;
  votes: number;
  status: string;
  requesterId: string;
  createdAt: string;
  updatedAt: string;
  requester?: {
    id: string;
    username: string;
    displayName: string;
  };
}

export interface DashboardDTO {
  profile: UserDTO;
  stats: {
    totalExperiences: number;
    totalRequests: number;
    averageRating: number;
  };
  recentExperiences: ExperienceDTO[];
  recentRequests: RequestDTO[];
}
