import { z } from 'zod';

export const createSubjectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  icon: z.string().max(50).optional(),
  images: z.array(z.string()).max(10).optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const subjectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'experienceCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectDto = z.infer<typeof updateSubjectSchema>;
export type SubjectQueryDto = z.infer<typeof subjectQuerySchema>;
