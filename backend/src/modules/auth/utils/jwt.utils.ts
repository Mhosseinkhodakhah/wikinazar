import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../../config';
import { type TokenPayload } from '../interfaces/auth.interface';

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: env.jwt.expiresIn as any };
  return jwt.sign(payload, env.jwt.secret, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: env.jwt.refreshExpiresIn as any };
  return jwt.sign(payload, env.jwt.secret, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwt.secret) as TokenPayload;
}
