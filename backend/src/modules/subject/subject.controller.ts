import { type Request, type Response } from 'express';
import { SubjectService } from './subject.service';
import { asyncHandler } from '../../shared/middleware/async-handler';
import { logger } from '../../shared/logger/logger';

const subjectService = new SubjectService();

export const subjectController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Subject findAll', { query: req.query });
    const result = await subjectService.findAll(req.query as any);
    res.status(200).json({ success: true, data: result });
  }),

  findBySlug: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Subject findBySlug', { slug: req.params.slug });
    const result = await subjectService.findBySlug(req.params.slug);
    res.status(200).json({ success: true, data: result });
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Subject findById', { id: req.params.id });
    const result = await subjectService.findById(req.params.id);
    res.status(200).json({ success: true, data: result });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Subject create', { title: req.body.title, userId: req.user?.id });
    const result = await subjectService.create(req.body);
    logger.info('Subject created', { id: result.id, title: result.title });
    res.status(201).json({ success: true, data: result });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Subject update', { id: req.params.id, userId: req.user?.id });
    const result = await subjectService.update(req.params.id, req.body);
    logger.info('Subject updated', { id: result.id });
    res.status(200).json({ success: true, data: result });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Subject delete', { id: req.params.id, userId: req.user?.id });
    await subjectService.delete(req.params.id);
    logger.info('Subject deleted', { id: req.params.id });
    res.status(204).send();
  }),
};
