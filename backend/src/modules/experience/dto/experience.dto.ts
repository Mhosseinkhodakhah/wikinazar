import { z } from 'zod';

export const createExperienceSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000),
  rating: z.number().int().min(1).max(5),
  subjectId: z.string().uuid('Invalid subject ID'),
  tags: z.array(z.string().max(30)).max(10).optional(),
  images: z.array(z.string()).max(10).optional(),
});

export const updateExperienceSchema = z.object({
  content: z.string().min(10).max(5000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export const experienceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  subjectId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  sortBy: z.enum(['createdAt', 'rating', 'likes']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateExperienceDto = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceDto = z.infer<typeof updateExperienceSchema>;
export type ExperienceQueryDto = z.infer<typeof experienceQuerySchema>;
