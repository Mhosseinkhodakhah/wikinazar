import { type Request, type Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../shared/middleware/async-handler';
import { logger } from '../../shared/logger/logger';

const authService = new AuthService();

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Auth register attempt', { email: req.body.email });
    const result = await authService.register(req.body);
    logger.info('Auth register successful', { userId: result.user.id });
    res.status(201).json({ success: true, data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Auth login attempt', { email: req.body.email });
    const result = await authService.login(req.body);
    logger.info('Auth login successful', { userId: result.user.id });
    res.status(200).json({ success: true, data: result });
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Auth getProfile', { userId });
    const result = await authService.getProfile(userId);
    res.status(200).json({ success: true, data: result });
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    logger.info('Auth refreshToken attempt');
    const result = await authService.refreshToken(refreshToken);
    logger.info('Auth refreshToken successful');
    res.status(200).json({ success: true, data: result });
  }),
};
