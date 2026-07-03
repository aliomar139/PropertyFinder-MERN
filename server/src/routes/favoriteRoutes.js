import { Router } from 'express';
import { toggleFavorite, listFavorites } from '../controllers/favoriteController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', listFavorites);
router.post('/:propertyId/toggle', toggleFavorite);
export default router;
