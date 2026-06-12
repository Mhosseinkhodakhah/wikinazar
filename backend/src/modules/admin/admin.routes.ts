import { Router } from 'express';
import { adminController } from './admin.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { adminLoginSchema } from './dto/login.dto';
import { createAdminSchema } from './dto/create-admin.dto';
import { updateAdminSchema } from './dto/update-admin.dto';
import { adminGuard } from './guards/admin.guard';
import { permissionGuard } from './guards/permission.guard';

const adminRouter = Router();

adminRouter.post('/login', validate(adminLoginSchema), adminController.login);
adminRouter.get('/me', adminGuard, adminController.getProfile);
adminRouter.get('/dashboard', adminGuard, permissionGuard('dashboard'), adminController.getDashboard);

adminRouter.get('/admins', adminGuard, permissionGuard('admins'), adminController.getAllAdmins);
adminRouter.get('/admins/:id', adminGuard, permissionGuard('admins'), adminController.getAdminById);
adminRouter.post('/admins', adminGuard, permissionGuard('admins'), validate(createAdminSchema), adminController.createAdmin);
adminRouter.patch('/admins/:id', adminGuard, permissionGuard('admins'), validate(updateAdminSchema), adminController.updateAdmin);
adminRouter.delete('/admins/:id', adminGuard, permissionGuard('admins'), adminController.deleteAdmin);

adminRouter.get('/users', adminGuard, permissionGuard('users'), adminController.getAllUsers);
adminRouter.get('/users/:id', adminGuard, permissionGuard('users'), adminController.getUserById);
adminRouter.patch('/users/:id', adminGuard, permissionGuard('users'), adminController.updateUser);
adminRouter.delete('/users/:id', adminGuard, permissionGuard('users'), adminController.deleteUser);

adminRouter.get('/subjects', adminGuard, permissionGuard('subjects'), adminController.getAllSubjects);
adminRouter.post('/subjects', adminGuard, permissionGuard('subjects'), adminController.createSubject);
adminRouter.patch('/subjects/:id', adminGuard, permissionGuard('subjects'), adminController.updateSubject);
adminRouter.delete('/subjects/:id', adminGuard, permissionGuard('subjects'), adminController.deleteSubject);

adminRouter.get('/experiences', adminGuard, permissionGuard('experiences'), adminController.getAllExperiences);
adminRouter.get('/experiences/:id', adminGuard, permissionGuard('experiences'), adminController.getExperienceById);
adminRouter.delete('/experiences/:id', adminGuard, permissionGuard('experiences'), adminController.deleteExperience);

adminRouter.get('/requests', adminGuard, permissionGuard('requests'), adminController.getAllRequests);
adminRouter.patch('/requests/:id/status', adminGuard, permissionGuard('requests'), adminController.updateRequestStatus);
adminRouter.delete('/requests/:id', adminGuard, permissionGuard('requests'), adminController.deleteRequest);

export { adminRouter };
