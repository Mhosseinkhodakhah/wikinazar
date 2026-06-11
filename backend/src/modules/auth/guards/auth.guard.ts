import { type Request, type Response, type NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { UnauthorizedError } from '../../../shared/errors/http-error';
import { Role } from '../models/user.entity';
import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

export function authGuard(req: Request, _res: Response, next: NextFunction): void {
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
    const payload = verifyToken(token);

    // Verify user still exists in the database
    userRepository.findById(payload.sub).then((user) => {
      if (!user) {
        return next(new UnauthorizedError('User no longer exists'));
      }

      req.user = {
        id: payload.sub,
        email: payload.email,
        role: user.role,
        username: payload.username || user.username,
      };
      next();
    }).catch(() => {
      return next(new UnauthorizedError('User verification failed'));
    });
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}
