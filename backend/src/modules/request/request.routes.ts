import { Router } from 'express';
import { requestController } from './request.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { createRequestSchema, requestQuerySchema } from './dto/request.dto';
import { authGuard } from '../auth/guards/auth.guard';
import { rolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/models/user.entity';

const requestRouter = Router();

requestRouter.get('/', validate(requestQuerySchema, 'query'), requestController.findAll);
requestRouter.post('/', authGuard, validate(createRequestSchema), requestController.create);
requestRouter.post('/:id/vote', authGuard, requestController.vote);
requestRouter.patch('/:id/status', authGuard, rolesGuard(Role.EXPERT), requestController.updateStatus);

export { requestRouter };
