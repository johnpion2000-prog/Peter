import { Request, Response } from 'express';
import { bookingsCollection } from '../models/Booking.model';

export const createBooking = async (req: Request, res: Response) => {
    try {
        const booking = {
            userId: req.body.userId,
            serviceId: req.body.serviceId || null,
            productId: req.body.productId || null,
            date: req.body.date,
            time: req.body.time,
            status: 'pending',
            createdAt: new Date(),
        };
        const ref = await bookingsCollection.add(booking);
        res.status(201).json({ id: ref.id, ...booking });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getUserBookings = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const snapshot = await bookingsCollection.where('userId', '==', userId).get();
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(bookings);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getBookings = async (req: Request, res: Response) => {
    try {
        const snapshot = await bookingsCollection.get();
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(bookings);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getBookingById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const doc = await bookingsCollection.doc(id).get();
        if (!doc.exists) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const updateBooking = async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const { status } = req.body;
    try {
        const ref = bookingsCollection.doc(bookingId);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'Booking not found' });
        await ref.update({ status });
        const updated = await ref.get();
        res.status(200).json({ id: updated.id, ...updated.data() });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteBooking = async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    try {
        const ref = bookingsCollection.doc(bookingId);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'Booking not found' });
        await ref.delete();
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};