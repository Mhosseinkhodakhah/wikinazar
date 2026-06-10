import { Router } from 'express';
import { experienceController } from './experience.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { createExperienceSchema, updateExperienceSchema, experienceQuerySchema } from './dto/experience.dto';
import { authGuard } from '../auth/guards/auth.guard';

const experienceRouter = Router();

experienceRouter.get('/', validate(experienceQuerySchema, 'query'), experienceController.findAll);
experienceRouter.get('/stats/:subjectId', experienceController.getSubjectStats);
experienceRouter.get('/:id', experienceController.findById);

experienceRouter.post('/', authGuard, validate(createExperienceSchema), experienceController.create);
experienceRouter.patch('/:id', authGuard, validate(updateExperienceSchema), experienceController.update);
experienceRouter.delete('/:id', authGuard, experienceController.delete);
experienceRouter.post('/:id/like', authGuard, experienceController.like);

export { experienceRouter };
