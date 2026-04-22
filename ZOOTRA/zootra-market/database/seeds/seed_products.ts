import { db } from '../../backend/src/config/firebase.config';

const seedProducts = async () => {
    const products = [
        {
            userId: 'seed-user-001',
            categoryId: 'seed-cat-livestock',
            title: 'Dairy Cow (Friesian)',
            description: 'High-yield Friesian dairy cow, 3 years old, healthy.',
            price: 850000,
            images: [],
            status: 'approved',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'seed-user-001',
            categoryId: 'seed-cat-feed',
            title: 'Maize Bran (50kg bag)',
            description: 'Premium quality maize bran for livestock feeding.',
            price: 8500,
            images: [],
            status: 'approved',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'seed-user-001',
            categoryId: 'seed-cat-livestock',
            title: 'Layer Hens (50 birds)',
            description: '50 fully grown layer hens, producing daily.',
            price: 75000,
            images: [],
            status: 'approved',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'seed-user-001',
            categoryId: 'seed-cat-pet',
            title: 'Dog Food – Royal Canin',
            description: 'Royal Canin adult medium breed, 15kg bag.',
            price: 35000,
            images: [],
            status: 'pending',
            createdAt: new Date().toISOString(),
        },
    ];

    try {
        for (const product of products) {
            await db.collection('products').add(product);
        }
        console.log('Products seeded successfully!');
    } catch (error) {
        console.error('Error seeding products:', error);
    }
};

seedProducts();