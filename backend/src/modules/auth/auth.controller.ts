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

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Auth updateProfile', { userId });
    const result = await authService.updateProfile(userId, req.body);
    res.status(200).json({ success: true, data: result });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Auth changePassword', { userId });
    await authService.changePassword(userId, req.body);
    res.status(200).json({ success: true, data: { message: 'Password updated successfully' } });
  }),

  uploadAvatar: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info('Auth uploadAvatar', { userId });
    const file = req.file as Express.Multer.File;
    if (!file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const avatarUrl = await authService.uploadAvatar(userId, file, baseUrl);
    res.status(200).json({ success: true, data: { avatarUrl } });
  }),
};
