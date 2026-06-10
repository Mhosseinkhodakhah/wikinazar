import { Router } from 'express';
import { subjectRouter } from './subject.routes';

const moduleRouter = Router();

moduleRouter.use('/subjects', subjectRouter);

export { moduleRouter as subjectModule };
