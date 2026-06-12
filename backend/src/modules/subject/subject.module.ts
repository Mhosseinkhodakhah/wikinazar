import { Router } from 'express';
import { subjectRouter } from './subject.routes';
import { categoryRouter } from './category.routes';

const moduleRouter = Router();

moduleRouter.use('/subjects', subjectRouter);
moduleRouter.use('/categories', categoryRouter);

export { moduleRouter as subjectModule };
