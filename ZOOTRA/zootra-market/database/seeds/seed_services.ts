import { db } from '../../backend/src/config/firebase.config';

const seedServices = async () => {
    const services = [
        {
            userId: 'seed-user-002',
            serviceType: 'vet',
            description: 'Licensed veterinarian specialising in large animals. Farm visits available.',
            price: 15000,
            availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '08:00-17:00' },
            isVerified: true,
            status: 'approved',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'seed-user-002',
            serviceType: 'groomer',
            description: 'Professional pet grooming – bath, trim, nail clipping. Mobile service.',
            price: 8000,
            availability: { days: ['Mon', 'Wed', 'Fri', 'Sat'], hours: '09:00-18:00' },
            isVerified: false,
            status: 'pending',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'seed-user-002',
            serviceType: 'trainer',
            description: 'Certified dog & livestock trainer. Group and individual sessions.',
            price: 12000,
            availability: { days: ['Sat', 'Sun'], hours: '07:00-14:00' },
            isVerified: true,
            status: 'approved',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'seed-user-002',
            serviceType: 'consultant',
            description: 'Farm management consultancy for poultry and dairy operations.',
            price: 20000,
            availability: { days: ['Mon', 'Thu'], hours: '10:00-16:00' },
            isVerified: true,
            status: 'approved',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'seed-user-002',
            serviceType: 'transport',
            description: 'Safe livestock transport within Kigali and nearby provinces.',
            price: 25000,
            availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], hours: '06:00-20:00' },
            isVerified: false,
            status: 'pending',
            createdAt: new Date().toISOString(),
        },
    ];

    try {
        for (const service of services) {
            await db.collection('services').add(service);
        }
        console.log('Services seeded successfully!');
    } catch (error) {
        console.error('Error seeding services:', error);
    }
};

seedServices();
