import { type Request, type Response, type NextFunction } from 'express';
import { type AdminPermission } from '../models/admin.entity';
import { ForbiddenError } from '../../../shared/errors/http-error';

export function permissionGuard(...requiredPermissions: AdminPermission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const admin = req.admin;

    if (!admin) {
      return next(new ForbiddenError('Admin authentication required'));
    }

    if (admin.isSuperAdmin) {
      return next();
    }

    const hasAllPermissions = requiredPermissions.every((perm) =>
      admin.permissions.includes(perm),
    );

    if (!hasAllPermissions) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}
