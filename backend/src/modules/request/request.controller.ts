import { type Request, type Response } from 'express';
import { RequestService } from './request.service';
import { asyncHandler } from '../../shared/middleware/async-handler';
import { logger } from '../../shared/logger/logger';

const requestService = new RequestService();

export const requestController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Request findAll', { query: req.query });
    const result = await requestService.findAll(req.query as any);
    res.status(200).json({ success: true, data: result });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Request create', { userId, title: req.body.title });
    const result = await requestService.create(req.body, userId);
    logger.info('Request created', { id: result.id });
    res.status(201).json({ success: true, data: result });
  }),

  vote: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Request vote', { id: req.params.id, userId });
    const result = await requestService.vote(req.params.id, userId);
    res.status(200).json({ success: true, data: result });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Request updateStatus', { id: req.params.id, status: req.body.status, userId: req.user?.id });
    const { status } = req.body;
    const result = await requestService.updateStatus(req.params.id, status);
    logger.info('Request status updated', { id: result.id, status });
    res.status(200).json({ success: true, data: result });
  }),

  uploadImages: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Request uploadImages', { userId });
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: { message: 'No files uploaded' } });
      return;
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls = files.map((f) => `${baseUrl}/uploads/requests/${f.filename}`);
    res.status(200).json({ success: true, data: { images: urls } });
  }),
};
