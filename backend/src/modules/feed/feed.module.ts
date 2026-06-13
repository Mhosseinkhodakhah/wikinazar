import { Router } from 'express';
import { feedRouter } from './feed.routes';

const moduleRouter = Router();

moduleRouter.use('/feed', feedRouter);

export { moduleRouter as feedModule };
