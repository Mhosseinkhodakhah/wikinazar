import { z } from 'zod';

export const updateUserSchema = z.object({
  role: z.enum(['USER', 'EXPERT']).optional(),
  displayName: z.string().max(100).optional().nullable(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
