import { type Request, type Response } from 'express';
import { RequestService } from './request.service';
import { asyncHandler } from '../../shared/middleware/async-handler';

const requestService = new RequestService();

export const requestController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await requestService.findAll(req.query as any);
    res.status(200).json({ success: true, data: result });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await requestService.create(req.body, userId);
    res.status(201).json({ success: true, data: result });
  }),

  vote: asyncHandler(async (req: Request, res: Response) => {
    const result = await requestService.vote(req.params.id);
    res.status(200).json({ success: true, data: result });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const result = await requestService.updateStatus(req.params.id, status);
    res.status(200).json({ success: true, data: result });
  }),
};
