import { Router } from 'express';
import { dashboardRouter } from './dashboard.routes';

const moduleRouter = Router();

moduleRouter.use('/dashboard', dashboardRouter);

export { moduleRouter as dashboardModule };
