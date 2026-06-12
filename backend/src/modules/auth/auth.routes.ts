import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { v4 as uuid } from 'uuid';
import { authController } from './auth.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { registerSchema } from './dto/register.dto';
import { loginSchema } from './dto/login.dto';
import { refreshSchema } from './dto/refresh.dto';
import { updateProfileSchema } from './dto/update-profile.dto';
import { changePasswordSchema } from './dto/change-password.dto';
import { authGuard } from './guards/auth.guard';

const authRouter = Router();

const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', '..', 'uploads', 'avatars'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuid()}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
  }
};

const upload = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.get('/profile', authGuard, authController.getProfile);
authRouter.post('/refresh', validate(refreshSchema), authController.refreshToken);
authRouter.put('/profile', authGuard, validate(updateProfileSchema), authController.updateProfile);
authRouter.put('/password', authGuard, validate(changePasswordSchema), authController.changePassword);
authRouter.post('/avatar', authGuard, upload.single('avatar'), authController.uploadAvatar);

export { authRouter };
