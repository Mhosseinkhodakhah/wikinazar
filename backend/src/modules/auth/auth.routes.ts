import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../shared/middleware/validation.middleware';
import { registerSchema } from './dto/register.dto';
import { loginSchema } from './dto/login.dto';
import { authGuard } from './guards/auth.guard';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.get('/profile', authGuard, authController.getProfile);
authRouter.post('/refresh', authGuard, authController.refreshToken);

export { authRouter };
