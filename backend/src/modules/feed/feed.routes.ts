import { Router } from 'express';
import { feedController } from './feed.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { feedQuerySchema } from './dto/feed.dto';

const feedRouter = Router();

feedRouter.get('/', validate(feedQuerySchema, 'query'), feedController.findAll);

export { feedRouter };
