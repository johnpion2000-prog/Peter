import { usersCollection } from '../models/User.model';
import { productsCollection } from '../models/Product.model';
import { servicesCollection } from '../models/Service.model';
import { bookingsCollection } from '../models/Booking.model';
import { reviewsCollection } from '../models/Review.model';

export const getAnalyticsData = async () => {
    const [usersSnap, productsSnap, servicesSnap, bookingsSnap, reviewsSnap] = await Promise.all([
        usersCollection.get(),
        productsCollection.get(),
        servicesCollection.get(),
        bookingsCollection.get(),
        reviewsCollection.get(),
    ]);

    // User role breakdown
    const roleCount: Record<string, number> = {};
    usersSnap.docs.forEach(doc => {
        const role = (doc.data() as any).role || 'unknown';
        roleCount[role] = (roleCount[role] || 0) + 1;
    });

    // Product status breakdown
    const productStatusCount: Record<string, number> = {};
    productsSnap.docs.forEach(doc => {
        const status = (doc.data() as any).status || 'unknown';
        productStatusCount[status] = (productStatusCount[status] || 0) + 1;
    });

    // Service type breakdown
    const serviceTypeCount: Record<string, number> = {};
    servicesSnap.docs.forEach(doc => {
        const type = (doc.data() as any).serviceType || 'unknown';
        serviceTypeCount[type] = (serviceTypeCount[type] || 0) + 1;
    });

    // Booking status breakdown
    const bookingStatusCount: Record<string, number> = {};
    bookingsSnap.docs.forEach(doc => {
        const status = (doc.data() as any).status || 'unknown';
        bookingStatusCount[status] = (bookingStatusCount[status] || 0) + 1;
    });

    return {
        totals: {
            users: usersSnap.size,
            products: productsSnap.size,
            services: servicesSnap.size,
            bookings: bookingsSnap.size,
            reviews: reviewsSnap.size,
        },
        usersByRole: roleCount,
        productsByStatus: productStatusCount,
        servicesByType: serviceTypeCount,
        bookingsByStatus: bookingStatusCount,
    };
};
