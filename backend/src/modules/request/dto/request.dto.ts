import { z } from 'zod';

export const createRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(2000).optional(),
  category: z.string().optional(),
  images: z.array(z.string()).max(10).optional(),
});

export const requestQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['open', 'fulfilled', 'closed']).optional(),
  category: z.string().optional(),
  sortBy: z.enum(['createdAt', 'votes']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['open', 'fulfilled', 'closed']),
});

export type CreateRequestDto = z.infer<typeof createRequestSchema>;
export type RequestQueryDto = z.infer<typeof requestQuerySchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
