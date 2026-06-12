import { Router } from 'express';
import { subjectController } from './subject.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { createSubjectSchema, updateSubjectSchema, subjectQuerySchema } from './dto/subject.dto';
import { authGuard } from '../auth/guards/auth.guard';
import { rolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/models/user.entity';

const subjectRouter = Router();

subjectRouter.get('/', validate(subjectQuerySchema, 'query'), subjectController.findAll);
subjectRouter.get('/slug/:slug', subjectController.findBySlug);
subjectRouter.get('/:id', subjectController.findById);

subjectRouter.post('/', authGuard, rolesGuard(Role.USER), validate(createSubjectSchema), subjectController.create);
subjectRouter.patch('/:id', authGuard, rolesGuard(Role.USER), validate(updateSubjectSchema), subjectController.update);
subjectRouter.delete('/:id', authGuard, rolesGuard(Role.USER), subjectController.delete);

export { subjectRouter };
