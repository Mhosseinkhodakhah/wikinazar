import { z } from 'zod';
import { ADMIN_PERMISSIONS } from '../models/admin.entity';

export const createAdminSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  displayName: z.string().max(100).optional().nullable(),
  permissions: z
    .array(z.enum(ADMIN_PERMISSIONS))
    .default([]),
});

export type CreateAdminDto = z.infer<typeof createAdminSchema>;
