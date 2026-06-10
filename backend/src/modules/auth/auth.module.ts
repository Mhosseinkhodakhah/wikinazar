import { Router } from 'express';
import { authRouter } from './auth.routes';

const moduleRouter = Router();

moduleRouter.use('/auth', authRouter);

export { moduleRouter as authModule };
