import { type Request, type Response } from 'express';
import { CategoryService } from './category.service';
import { asyncHandler } from '../../shared/middleware/async-handler';
import { logger } from '../../shared/logger/logger';

const categoryService = new CategoryService();

export const categoryController = {
  findAll: asyncHandler(async (_req: Request, res: Response) => {
    logger.info('Category findAll');
    const result = await categoryService.findAll();
    res.status(200).json({ success: true, data: result });
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Category findById', { id: req.params.id });
    const result = await categoryService.findById(req.params.id);
    res.status(200).json({ success: true, data: result });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Category create', { body: req.body });
    const result = await categoryService.create(req.body);
    res.status(201).json({ success: true, data: result });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Category update', { id: req.params.id, body: req.body });
    const result = await categoryService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: result });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Category delete', { id: req.params.id });
    await categoryService.delete(req.params.id);
    res.status(200).json({ success: true, data: null });
  }),
};
