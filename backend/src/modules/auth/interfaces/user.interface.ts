import { type Role } from '../models/user.entity';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: Role;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}
