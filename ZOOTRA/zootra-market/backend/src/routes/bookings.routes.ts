import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { bookingValidator } from '../validators/booking.validator';

const router = Router();

// Create a new booking
router.post('/', authMiddleware, bookingValidator, createBooking);

// Get all bookings for a user
router.get('/', authMiddleware, getBookings);

// Get a specific booking by ID
router.get('/:id', authMiddleware, getBookingById);

// Update a booking
router.put('/:id', authMiddleware, bookingValidator, updateBooking);

// Delete a booking
router.delete('/:id', authMiddleware, deleteBooking);

export const bookingsRoutes = router;
export default router;