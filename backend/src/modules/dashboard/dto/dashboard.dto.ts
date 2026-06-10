import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(5),
});

export type DashboardQueryDto = z.infer<typeof dashboardQuerySchema>;
