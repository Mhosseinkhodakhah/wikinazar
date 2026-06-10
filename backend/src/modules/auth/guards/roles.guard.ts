import { type Request, type Response, type NextFunction } from 'express';
import { type Role } from '../models/user.entity';
import { ForbiddenError } from '../../../shared/errors/http-error';

export function rolesGuard(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}
