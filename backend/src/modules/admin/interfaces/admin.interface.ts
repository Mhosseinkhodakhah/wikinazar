import { type AdminPermission } from '../models/admin.entity';

export interface AdminResponse {
  id: string;
  username: string;
  displayName: string | null;
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminTokenPayload {
  sub: string;
  username: string;
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
}

export interface AdminAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AdminLoginResponse {
  admin: AdminResponse;
  tokens: AdminAuthTokens;
}
