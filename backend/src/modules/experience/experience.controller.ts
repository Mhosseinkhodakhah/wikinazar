import { type Request, type Response } from 'express';
import { ExperienceService } from './experience.service';
import { asyncHandler } from '../../shared/middleware/async-handler';
import { logger } from '../../shared/logger/logger';

const experienceService = new ExperienceService();

export const experienceController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Experience findAll', { query: req.query });
    const result = await experienceService.findAll(req.query as any);
    res.status(200).json({ success: true, data: result });
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Experience findById', { id: req.params.id });
    const result = await experienceService.findById(req.params.id);
    res.status(200).json({ success: true, data: result });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Experience create', { userId, subjectId: req.body.subjectId });
    const result = await experienceService.create(req.body, userId);
    logger.info('Experience created', { id: result.id, userId });
    res.status(201).json({ success: true, data: result });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Experience update', { id: req.params.id, userId });
    const result = await experienceService.update(req.params.id, req.body, userId);
    logger.info('Experience updated', { id: result.id });
    res.status(200).json({ success: true, data: result });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Experience delete', { id: req.params.id, userId });
    await experienceService.delete(req.params.id, userId);
    logger.info('Experience deleted', { id: req.params.id });
    res.status(204).send();
  }),

  like: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Experience like', { id: req.params.id, userId });
    const result = await experienceService.like(req.params.id, userId);
    res.status(200).json({ success: true, data: result });
  }),

  getSubjectStats: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Experience getSubjectStats', { subjectId: req.params.subjectId });
    const result = await experienceService.getSubjectStats(req.params.subjectId);
    res.status(200).json({ success: true, data: result });
  }),

  uploadImages: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Experience uploadImages', { userId });
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: { message: 'No files uploaded' } });
      return;
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls = files.map((f) => `${baseUrl}/uploads/experiences/${f.filename}`);
    res.status(200).json({ success: true, data: { images: urls } });
  }),
};
