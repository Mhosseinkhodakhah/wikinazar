import { z } from 'zod';
import { ADMIN_PERMISSIONS } from '../models/admin.entity';

export const updateAdminSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(8).max(100).optional(),
  displayName: z.string().max(100).optional().nullable(),
  permissions: z.array(z.enum(ADMIN_PERMISSIONS)).optional(),
});

export type UpdateAdminDto = z.infer<typeof updateAdminSchema>;
