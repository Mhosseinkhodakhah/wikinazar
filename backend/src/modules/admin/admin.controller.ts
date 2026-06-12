import { type Request, type Response } from 'express';
import { AdminService } from './admin.service';
import { asyncHandler } from '../../shared/middleware/async-handler';
import { logger } from '../../shared/logger/logger';

const adminService = new AdminService();

export const adminController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin login attempt', { username: req.body.username });
    const result = await adminService.login(req.body);
    logger.info('Admin login successful', { adminId: result.admin.id });
    res.status(200).json({ success: true, data: result });
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.admin!.id;
    const result = await adminService.getProfile(adminId);
    res.status(200).json({ success: true, data: result });
  }),

  getAllAdmins: asyncHandler(async (_req: Request, res: Response) => {
    const result = await adminService.getAllAdmins();
    res.status(200).json({ success: true, data: result });
  }),

  getAdminById: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getAdminById(req.params.id);
    res.status(200).json({ success: true, data: result });
  }),

  createAdmin: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin create attempt', { username: req.body.username });
    const result = await adminService.createAdmin(req.body);
    logger.info('Admin created', { adminId: result.id });
    res.status(201).json({ success: true, data: result });
  }),

  updateAdmin: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin update attempt', { id: req.params.id });
    const result = await adminService.updateAdmin(req.params.id, req.body);
    logger.info('Admin updated', { id: req.params.id });
    res.status(200).json({ success: true, data: result });
  }),

  deleteAdmin: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin delete attempt', { id: req.params.id });
    await adminService.deleteAdmin(req.params.id);
    logger.info('Admin deleted', { id: req.params.id });
    res.status(200).json({ success: true, data: null });
  }),

  getDashboard: asyncHandler(async (_req: Request, res: Response) => {
    const result = await adminService.getDashboardStats();
    res.status(200).json({ success: true, data: result });
  }),

  getAllUsers: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;
    const result = await adminService.getAllUsers({ page, limit, search, role });
    res.status(200).json({ success: true, data: result });
  }),

  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: result });
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin update user', { id: req.params.id });
    const result = await adminService.updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, data: result });
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin delete user', { id: req.params.id });
    await adminService.deleteUser(req.params.id);
    res.status(200).json({ success: true, data: null });
  }),

  getAllSubjects: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const result = await adminService.getAllSubjects({ page, limit, search, category });
    res.status(200).json({ success: true, data: result });
  }),

  createSubject: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin create subject', { title: req.body.title });
    const result = await adminService.createSubject(req.body);
    logger.info('Subject created', { subjectId: result.id });
    res.status(201).json({ success: true, data: result });
  }),

  updateSubject: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin update subject', { id: req.params.id });
    const result = await adminService.updateSubject(req.params.id, req.body);
    res.status(200).json({ success: true, data: result });
  }),

  deleteSubject: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin delete subject', { id: req.params.id });
    await adminService.deleteSubject(req.params.id);
    res.status(200).json({ success: true, data: null });
  }),

  getAllExperiences: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const subjectId = req.query.subjectId as string | undefined;
    const authorId = req.query.authorId as string | undefined;
    const minRating = req.query.minRating ? parseInt(req.query.minRating as string) : undefined;
    const result = await adminService.getAllExperiences({ page, limit, subjectId, authorId, minRating });
    res.status(200).json({ success: true, data: result });
  }),

  getExperienceById: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getExperienceById(req.params.id);
    res.status(200).json({ success: true, data: result });
  }),

  deleteExperience: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin delete experience', { id: req.params.id });
    await adminService.deleteExperience(req.params.id);
    res.status(200).json({ success: true, data: null });
  }),

  getAllRequests: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await adminService.getAllRequests({ page, limit, status });
    res.status(200).json({ success: true, data: result });
  }),

  updateRequestStatus: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin update request status', { id: req.params.id, status: req.body.status });
    const result = await adminService.updateRequestStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data: result });
  }),

  deleteRequest: asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin delete request', { id: req.params.id });
    await adminService.deleteRequest(req.params.id);
    res.status(200).json({ success: true, data: null });
  }),
};
