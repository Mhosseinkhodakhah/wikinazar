import { type Request, type Response } from 'express';
import { SubjectService } from './subject.service';
import { asyncHandler } from '../../shared/middleware/async-handler';

const subjectService = new SubjectService();

export const subjectController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await subjectService.findAll(req.query as any);
    res.status(200).json({ success: true, data: result });
  }),

  findBySlug: asyncHandler(async (req: Request, res: Response) => {
    const result = await subjectService.findBySlug(req.params.slug);
    res.status(200).json({ success: true, data: result });
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const result = await subjectService.findById(req.params.id);
    res.status(200).json({ success: true, data: result });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const result = await subjectService.create(req.body);
    res.status(201).json({ success: true, data: result });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const result = await subjectService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: result });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await subjectService.delete(req.params.id);
    res.status(204).send();
  }),
};
