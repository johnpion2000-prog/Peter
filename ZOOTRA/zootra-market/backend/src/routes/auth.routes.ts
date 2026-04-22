import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateRegistration, validateLogin } from '../validators/user.validator';

const router = Router();

// User registration route
router.post('/register', validateRegistration, register);

// User login route
router.post('/login', validateLogin, login);

export const authRoutes = router;
export default router;