import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { v4 as uuid } from 'uuid';
import { requestController } from './request.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { createRequestSchema, requestQuerySchema, updateStatusSchema } from './dto/request.dto';
import { authGuard } from '../auth/guards/auth.guard';
import { rolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/models/user.entity';

const requestRouter = Router();

const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', '..', 'uploads', 'requests'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuid()}${ext}`);
  },
});

const imageFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
  }
};

const upload = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

requestRouter.get('/', validate(requestQuerySchema, 'query'), requestController.findAll);
requestRouter.post('/', authGuard, validate(createRequestSchema), requestController.create);
requestRouter.post('/images', authGuard, upload.array('images', 10), requestController.uploadImages);
requestRouter.post('/:id/vote', authGuard, requestController.vote);
requestRouter.patch('/:id/status', authGuard, rolesGuard(Role.USER), validate(updateStatusSchema), requestController.updateStatus);

export { requestRouter };
