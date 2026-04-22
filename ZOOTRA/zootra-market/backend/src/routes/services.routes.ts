import { Router } from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from '../controllers/service.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validateService } from '../validators/product.validator';

const router = Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Protected routes
router.use(authMiddleware);
router.post('/', validateService, createService);
router.put('/:id', validateService, updateService);
router.delete('/:id', adminMiddleware, deleteService);

export const servicesRoutes = router;
export default router;