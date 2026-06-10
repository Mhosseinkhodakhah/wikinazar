import { type Request, type Response } from 'express';
import { ExperienceService } from './experience.service';
import { asyncHandler } from '../../shared/middleware/async-handler';

const experienceService = new ExperienceService();

export const experienceController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await experienceService.findAll(req.query as any);
    res.status(200).json({ success: true, data: result });
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const result = await experienceService.findById(req.params.id);
    res.status(200).json({ success: true, data: result });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await experienceService.create(req.body, userId);
    res.status(201).json({ success: true, data: result });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await experienceService.update(req.params.id, req.body, userId);
    res.status(200).json({ success: true, data: result });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await experienceService.delete(req.params.id, userId);
    res.status(204).send();
  }),

  like: asyncHandler(async (req: Request, res: Response) => {
    const result = await experienceService.like(req.params.id);
    res.status(200).json({ success: true, data: result });
  }),

  getSubjectStats: asyncHandler(async (req: Request, res: Response) => {
    const result = await experienceService.getSubjectStats(req.params.subjectId);
    res.status(200).json({ success: true, data: result });
  }),
};
