import { Router } from 'express';
import { requestRouter } from './request.routes';

const moduleRouter = Router();

moduleRouter.use('/requests', requestRouter);

export { moduleRouter as requestModule };
