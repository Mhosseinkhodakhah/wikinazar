import { Router } from 'express';
import { categoryController } from './category.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { createCategorySchema, updateCategorySchema } from './dto/category.dto';
import { authGuard } from '../auth/guards/auth.guard';
import { rolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/models/user.entity';

const categoryRouter = Router();

categoryRouter.get('/', categoryController.findAll);
categoryRouter.get('/:id', categoryController.findById);
categoryRouter.post('/', authGuard, rolesGuard(Role.USER), validate(createCategorySchema), categoryController.create);
categoryRouter.patch('/:id', authGuard, rolesGuard(Role.USER), validate(updateCategorySchema), categoryController.update);
categoryRouter.delete('/:id', authGuard, rolesGuard(Role.USER), categoryController.delete);

export { categoryRouter };
