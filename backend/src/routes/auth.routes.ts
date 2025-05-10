import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import verifyToken from '../middlewares/verifyToken';
import { loginRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Route to register a new user
router.post('/register', register);

// Route to login a user
router.post('/login', loginRateLimiter, login);

// Route to get the authenticated user's information
router.get('/me', verifyToken, getMe);

export default router;