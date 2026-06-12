import { z } from 'zod';

export const createCategorySchema = z.object({
  slug: z.string().min(1).max(50),
  name: z.string().min(1).max(50),
  icon: z.string().min(1).max(10),
});

export const updateCategorySchema = z.object({
  slug: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(50).optional(),
  icon: z.string().min(1).max(10).optional(),
});

export const categoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
