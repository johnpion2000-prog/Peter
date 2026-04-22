import { db } from '../config/database.config';

export interface IBooking {
  id?: string;
  userId: string;
  serviceId?: string;
  productId?: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  whatsappChatId?: string;
  createdAt: Date;
}

export const bookingsCollection = db.collection('bookings');