import { Request, Response } from 'express';
import { usersCollection } from '../models/User.model';
import { productsCollection } from '../models/Product.model';
import { servicesCollection } from '../models/Service.model';
import { bookingsCollection } from '../models/Booking.model';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const snapshot = await usersCollection.get();
        const users = snapshot.docs.map(doc => {
            const { password, ...data } = doc.data() as any;
            return { id: doc.id, ...data };
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

export const suspendUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await usersCollection.doc(id).update({ suspended: true });
        res.status(200).json({ message: 'User suspended' });
    } catch (error) {
        res.status(500).json({ message: 'Error suspending user', error });
    }
};

export const activateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await usersCollection.doc(id).update({ suspended: false });
        res.status(200).json({ message: 'User activated' });
    } catch (error) {
        res.status(500).json({ message: 'Error activating user', error });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const ref = usersCollection.doc(id);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'User not found' });
        await ref.delete();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

export const getAllListings = async (req: Request, res: Response) => {
    try {
        const snapshot = await productsCollection.get();
        const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching listings', error });
    }
};

export const approveListing = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await productsCollection.doc(id).update({ status: 'approved' });
        res.status(200).json({ message: 'Listing approved' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving listing', error });
    }
};

export const rejectListing = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await productsCollection.doc(id).update({ status: 'rejected' });
        res.status(200).json({ message: 'Listing rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting listing', error });
    }
};

export const deleteListing = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const ref = productsCollection.doc(id);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'Listing not found' });
        await ref.delete();
        res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting listing', error });
    }
};

export const getAllServices = async (req: Request, res: Response) => {
    try {
        const snapshot = await servicesCollection.get();
        const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error });
    }
};

export const approveService = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await servicesCollection.doc(id).update({ status: 'approved', isVerified: true });
        res.status(200).json({ message: 'Service approved' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving service', error });
    }
};

export const rejectService = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await servicesCollection.doc(id).update({ status: 'rejected' });
        res.status(200).json({ message: 'Service rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting service', error });
    }
};

export const deleteService = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const ref = servicesCollection.doc(id);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'Service not found' });
        await ref.delete();
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service', error });
    }
};

export const verifySeller = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await usersCollection.doc(id).update({ isVerified: true });
        const doc = await usersCollection.doc(id).get();
        const { password, ...data } = doc.data() as any;
        res.status(200).json({ id: doc.id, ...data });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying seller', error });
    }
};

export const verifyServiceProvider = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await servicesCollection.doc(id).update({ isVerified: true, status: 'approved' });
        const doc = await servicesCollection.doc(id).get();
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying service provider', error });
    }
};

export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const [usersSnap, listingsSnap, bookingsSnap] = await Promise.all([
            usersCollection.get(),
            productsCollection.get(),
            bookingsCollection.get(),
        ]);
        res.status(200).json({
            totalUsers: usersSnap.size,
            totalListings: listingsSnap.size,
            totalBookings: bookingsSnap.size,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics', error });
    }
};
