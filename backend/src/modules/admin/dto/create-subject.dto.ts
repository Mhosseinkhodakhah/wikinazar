import { z } from 'zod';

export const createSubjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
});

export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;
