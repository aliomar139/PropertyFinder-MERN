import { Router } from 'express';
import {
  listProperties, myProperties, getProperty, createProperty,
  updateProperty, deleteProperty, clearImage
} from '../controllers/propertyController.js';
import { requireAuth } from '../middleware/auth.js';
import { propertyPhotosUpload } from '../middleware/upload.js';

const router = Router();
router.use(requireAuth); // the PHP app required login for all of these pages
router.get('/', listProperties);
router.get('/mine', myProperties);
router.post('/', propertyPhotosUpload, createProperty);
router.get('/:id', getProperty);
router.put('/:id', propertyPhotosUpload, updateProperty);
router.delete('/:id', deleteProperty);
router.delete('/:id/images/:imageId', clearImage);
export default router;
