import { db } from '../../backend/src/config/firebase.config';

const seedUsers = async () => {
    const users = [
        {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+250788000001',
            password: '$2b$10$REPLACE_WITH_BCRYPT_HASH',
            role: 'farmer',
            isVerified: true,
            verificationDocument: '',
            location: 'Kigali',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+250788000002',
            password: '$2b$10$REPLACE_WITH_BCRYPT_HASH',
            role: 'provider',
            isVerified: false,
            verificationDocument: '',
            location: 'Kigali',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Admin User',
            email: 'admin@zootra.com',
            phone: '+250788000003',
            password: '$2b$10$REPLACE_WITH_BCRYPT_HASH',
            role: 'admin',
            isVerified: true,
            verificationDocument: '',
            location: 'Kigali',
            createdAt: new Date().toISOString(),
        },
    ];

    try {
        for (const user of users) {
            await db.collection('users').add(user);
        }
        console.log('Users seeded successfully');
    } catch (error) {
        console.error('Error seeding users:', error);
    }
};

seedUsers();

seedUsers();