import { Router } from 'express';
import { createReport, listReports, ignoreReport } from '../controllers/reportController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.post('/', createReport);
router.get('/', requireAdmin, listReports);
router.delete('/:id', requireAdmin, ignoreReport);
export default router;
