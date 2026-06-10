import { type Request, type Response } from 'express';
import { DashboardService } from './dashboard.service';
import { asyncHandler } from '../../shared/middleware/async-handler';
import { logger } from '../../shared/logger/logger';

const dashboardService = new DashboardService();

export const dashboardController = {
  getDashboard: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Dashboard getDashboard', { userId });
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const result = await dashboardService.getDashboard(userId, limit);
    res.status(200).json({ success: true, data: result });
  }),
};
