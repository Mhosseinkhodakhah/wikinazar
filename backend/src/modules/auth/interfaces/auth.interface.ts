import { type UserResponse } from './user.interface';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  username: string;
}
