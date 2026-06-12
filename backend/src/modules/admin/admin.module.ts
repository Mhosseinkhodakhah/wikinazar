import { Router } from 'express';
import { adminRouter } from './admin.routes';

const moduleRouter = Router();

moduleRouter.use('/admin', adminRouter);

export { moduleRouter as adminModule };
