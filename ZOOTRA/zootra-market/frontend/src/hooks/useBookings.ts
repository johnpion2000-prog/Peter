import { useState, useEffect } from 'react';
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { bookingsCol } from '../firebase/collections';
import { updateBookingStatus, deleteBooking } from '../services/bookingService';
import { Booking, BookingStatus } from '../types/booking.types';

/** Admin hook — all bookings, real-time */
export const useAdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(bookingsCol, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Booking));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const changeStatus = (id: string, status: BookingStatus) =>
    updateBookingStatus(id, status);

  const remove = (id: string) => deleteBooking(id);

  return { bookings, loading, changeStatus, remove };
};

/** User hook — own bookings, real-time */
export const useUserBookings = (userId: string | undefined) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(bookingsCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Booking));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [userId]);

  // refetch is a no-op now (real-time keeps it fresh), kept for API compatibility
  const refetch = () => {};

  return { bookings, loading, refetch };
};
