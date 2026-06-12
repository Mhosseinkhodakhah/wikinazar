import { type Request } from 'express';
import { type Role } from '../../modules/auth/models/user.entity';
import { type AdminPermission } from '../../modules/admin/models/admin.entity';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: Role;
  };
  admin?: {
    id: string;
    username: string;
    isSuperAdmin: boolean;
    permissions: AdminPermission[];
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: Role;
      };
      admin?: {
        id: string;
        username: string;
        isSuperAdmin: boolean;
        permissions: AdminPermission[];
      };
    }
  }
}
