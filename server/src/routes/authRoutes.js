import { Router } from 'express';
import { signup, login, requestResetCode, verifyResetCode, resetPassword, changePassword, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/reset-code', requestResetCode);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.post('/change-password', requireAuth, changePassword);
router.get('/me', requireAuth, me);
export default router;
