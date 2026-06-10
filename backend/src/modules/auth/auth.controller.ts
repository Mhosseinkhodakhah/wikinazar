import { type Request, type Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../shared/middleware/async-handler';

const authService = new AuthService();

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await authService.getProfile(userId);
    res.status(200).json({ success: true, data: result });
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await authService.refreshToken(userId);
    res.status(200).json({ success: true, data: result });
  }),
};
