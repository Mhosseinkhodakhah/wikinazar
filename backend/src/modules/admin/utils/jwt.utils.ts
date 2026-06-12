import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../../config';
import { type AdminTokenPayload } from '../interfaces/admin.interface';
import { UnauthorizedError } from '../../../shared/errors/http-error';

let adminJwtSecret: string;

function getAdminJwtSecret(): string {
  if (!adminJwtSecret) {
    adminJwtSecret = env.jwt.secret + ':admin';
  }
  return adminJwtSecret;
}

export function generateAdminAccessToken(payload: AdminTokenPayload): string {
  const options: SignOptions = { expiresIn: '2h' };
  return jwt.sign(payload, getAdminJwtSecret(), options);
}

export function generateAdminRefreshToken(payload: AdminTokenPayload): string {
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, getAdminJwtSecret(), options);
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  try {
    return jwt.verify(token, getAdminJwtSecret()) as AdminTokenPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired admin token');
  }
}
