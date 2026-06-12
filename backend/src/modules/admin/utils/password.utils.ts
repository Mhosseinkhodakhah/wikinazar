import bcrypt from 'bcryptjs';
import { env } from '../../../config';

export async function hashAdminPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.bcrypt.saltRounds);
}

export async function compareAdminPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
