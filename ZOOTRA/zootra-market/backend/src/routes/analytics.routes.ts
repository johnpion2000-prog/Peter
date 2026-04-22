import { Router } from 'express';
import { getAnalyticsData } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// Route to get analytics data
router.get('/data', authMiddleware, adminMiddleware, getAnalyticsData);

export const analyticsRoutes = router;
export default router;