import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { createRateLimiter } from '../middlewares/rateLimit.js';

// Brute force: maks 10 percobaan per IP per 15 menit.
const loginLimiter = createRateLimiter({
  windowMs: 900000,
  max: 10,
  message: 'Terlalu banyak percobaan masuk, coba lagi nanti',
});
const registerLimiter = createRateLimiter({
  windowMs: 900000,
  max: 10,
  message: 'Terlalu banyak percobaan pendaftaran, coba lagi nanti',
});

const router = Router();

router.post('/register', registerLimiter, ctrl.register);
router.post('/login', loginLimiter, ctrl.login);
router.post('/google', ctrl.googleLogin);
router.get('/me', authenticate, ctrl.me);

export default router;
