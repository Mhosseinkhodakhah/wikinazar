import { z } from 'zod';

export const updateRequestStatusSchema = z.object({
  status: z.enum(['open', 'fulfilled', 'closed']),
});

export type UpdateRequestStatusDto = z.infer<typeof updateRequestStatusSchema>;
