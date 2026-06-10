import { Router } from 'express';
import { experienceRouter } from './experience.routes';

const moduleRouter = Router();

moduleRouter.use('/experiences', experienceRouter);

export { moduleRouter as experienceModule };
