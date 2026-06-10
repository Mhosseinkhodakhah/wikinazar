import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authGuard } from '../auth/guards/auth.guard';

const dashboardRouter = Router();

dashboardRouter.get('/', authGuard, dashboardController.getDashboard);

export { dashboardRouter };
