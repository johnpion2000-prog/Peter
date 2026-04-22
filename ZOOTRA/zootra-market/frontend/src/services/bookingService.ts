import {
  getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { bookingsCol, db } from '../firebase/collections';
import { Booking, BookingStatus } from '../types/booking.types';

export const getAllBookings = async (): Promise<Booking[]> => {
  const snap = await getDocs(query(bookingsCol, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Booking);
};

export const getBookingsByUser = async (userId: string): Promise<Booking[]> => {
  const snap = await getDocs(
    query(bookingsCol, where('userId', '==', userId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Booking);
};

export const createBooking = async (
  data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = await addDoc(bookingsCol, {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  } as any);
  return ref.id;
};

export const updateBookingStatus = async (
  id: string,
  status: BookingStatus
): Promise<void> => {
  await updateDoc(doc(db, 'bookings', id), { status, updatedAt: serverTimestamp() });
};

export const deleteBooking = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'bookings', id));
};
