import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { v4 as uuid } from 'uuid';
import { experienceController } from './experience.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { createExperienceSchema, updateExperienceSchema, experienceQuerySchema } from './dto/experience.dto';
import { authGuard } from '../auth/guards/auth.guard';

const experienceRouter = Router();

const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', '..', '..', 'uploads', 'experiences'),
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

experienceRouter.get('/', validate(experienceQuerySchema, 'query'), experienceController.findAll);
experienceRouter.get('/stats/:subjectId', experienceController.getSubjectStats);
experienceRouter.get('/:id', experienceController.findById);

experienceRouter.post('/', authGuard, validate(createExperienceSchema), experienceController.create);
experienceRouter.post('/images', authGuard, upload.array('images', 10), experienceController.uploadImages);
experienceRouter.patch('/:id', authGuard, validate(updateExperienceSchema), experienceController.update);
experienceRouter.delete('/:id', authGuard, experienceController.delete);
experienceRouter.post('/:id/like', authGuard, experienceController.like);

export { experienceRouter };
