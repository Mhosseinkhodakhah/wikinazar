import { z } from 'zod';

export const updateSubjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
});

export type UpdateSubjectDto = z.infer<typeof updateSubjectSchema>;
