import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
