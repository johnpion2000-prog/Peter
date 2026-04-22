import { db } from '../../backend/src/config/firebase.config';

const seedCategories = async () => {
    const categories = [
        { name: 'Livestock',     parentId: null, sortOrder: 1 },
        { name: 'Feed',          parentId: null, sortOrder: 2 },
        { name: 'Pet Products',  parentId: null, sortOrder: 3 },
        { name: 'Animal Health', parentId: null, sortOrder: 4 },
    ];

    try {
        const refs: Record<string, string> = {};
        for (const category of categories) {
            const ref = await db.collection('categories').add({ ...category, createdAt: new Date() });
            refs[category.name] = ref.id;
        }

        // Livestock subcategories
        const subcategories = [
            { name: 'Cattle',  parentId: refs['Livestock'], sortOrder: 1 },
            { name: 'Goats',   parentId: refs['Livestock'], sortOrder: 2 },
            { name: 'Pigs',    parentId: refs['Livestock'], sortOrder: 3 },
            { name: 'Poultry', parentId: refs['Livestock'], sortOrder: 4 },
        ];
        for (const sub of subcategories) {
            await db.collection('categories').add({ ...sub, createdAt: new Date() });
        }

        console.log('Categories seeded successfully!');
    } catch (error) {
        console.error('Error seeding categories:', error);
    }
};

seedCategories();