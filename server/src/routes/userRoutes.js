import { Router } from 'express';
import { getMe, updateMe, getUserDetails } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { profileUpload } from '../middleware/upload.js';

const router = Router();
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, profileUpload, updateMe);
router.get('/:id', requireAuth, getUserDetails);
export default router;
