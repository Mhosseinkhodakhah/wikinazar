import { type Request, type Response, type NextFunction } from 'express';
import { verifyAdminToken } from '../utils/jwt.utils';
import { UnauthorizedError } from '../../../shared/errors/http-error';

export function adminGuard(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError('No authorization header provided'));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new UnauthorizedError('Invalid authorization format. Use: Bearer <token>'));
  }

  const token = parts[1];

  try {
    const payload = verifyAdminToken(token);

    req.admin = {
      id: payload.sub,
      username: payload.username,
      isSuperAdmin: payload.isSuperAdmin,
      permissions: payload.permissions,
    };

    next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired admin token'));
  }
}
