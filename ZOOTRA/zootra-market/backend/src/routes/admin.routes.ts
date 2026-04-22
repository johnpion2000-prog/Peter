import { Router } from 'express';
import {
  getAllListings,
  approveListing,
  rejectListing,
  deleteListing,
  getAllServices,
  approveService,
  rejectService,
  deleteService,
  getAllUsers,
  suspendUser,
  activateUser,
  deleteUser,
  verifySeller,
  verifyServiceProvider,
  getAnalytics,
} from '../controllers/admin.controller';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// Manage Listings
router.get('/listings', adminMiddleware, getAllListings);
router.post('/listings/:id/approve', adminMiddleware, approveListing);
router.post('/listings/:id/reject', adminMiddleware, rejectListing);
router.delete('/listings/:id', adminMiddleware, deleteListing);

// Manage Services
router.get('/services', adminMiddleware, getAllServices);
router.post('/services/:id/approve', adminMiddleware, approveService);
router.post('/services/:id/reject', adminMiddleware, rejectService);
router.delete('/services/:id', adminMiddleware, deleteService);

// Manage Users
router.get('/users', adminMiddleware, getAllUsers);
router.post('/users/:id/suspend', adminMiddleware, suspendUser);
router.post('/users/:id/activate', adminMiddleware, activateUser);
router.delete('/users/:id', adminMiddleware, deleteUser);

// Verify Sellers and Service Providers
router.post('/verify/sellers/:id', adminMiddleware, verifySeller);
router.post('/verify/service-providers/:id', adminMiddleware, verifyServiceProvider);

// Analytics
router.get('/analytics', adminMiddleware, getAnalytics);

export const adminRoutes = router;
export default router;