import { Router } from 'express';
import { listUsers, listBanned, banUser, unbanUser, listAllProperties } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/users', listUsers);
router.get('/users/banned', listBanned);
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);
router.get('/properties', listAllProperties);
export default router;
