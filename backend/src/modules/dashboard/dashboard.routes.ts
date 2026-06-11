import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { dashboardQuerySchema } from './dto/dashboard.dto';
import { authGuard } from '../auth/guards/auth.guard';

const dashboardRouter = Router();

dashboardRouter.get('/', authGuard, validate(dashboardQuerySchema, 'query'), dashboardController.getDashboard);

export { dashboardRouter };
