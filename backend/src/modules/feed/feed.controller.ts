import { type Request, type Response } from 'express';
import { FeedService } from './feed.service';
import { asyncHandler } from '../../shared/middleware/async-handler';
import { logger } from '../../shared/logger/logger';

const feedService = new FeedService();

export const feedController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Feed findAll', { query: req.query });
    const result = await feedService.findAll(req.query as any);
    res.status(200).json({ success: true, data: result });
  }),
};
