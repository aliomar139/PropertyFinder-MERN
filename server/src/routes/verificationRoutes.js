import { Router } from 'express';
import { requestVerification, listPending, approve, reject } from '../controllers/verificationController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { idDocUpload } from '../middleware/upload.js';

const router = Router();
router.use(requireAuth);
router.post('/', idDocUpload, requestVerification);
router.get('/pending', requireAdmin, listPending);
router.put('/:id/approve', requireAdmin, approve);
router.put('/:id/reject', requireAdmin, reject);
export default router;
