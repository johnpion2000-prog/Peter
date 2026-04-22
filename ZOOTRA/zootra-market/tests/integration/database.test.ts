import * as admin from 'firebase-admin';

// Initialize admin SDK for integration tests (uses ADC credentials)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID || 'zootra-61405',
    });
}

const db = admin.firestore();
const TEST_COLLECTION = 'testCollection';

describe('Database Integration Tests', () => {
    let createdDocId: string;

    afterAll(async () => {
        // Clean up test documents
        if (createdDocId) {
            await db.collection(TEST_COLLECTION).doc(createdDocId).delete();
        }
    });

    it('should add a document to the collection', async () => {
        const docRef = await db.collection(TEST_COLLECTION).add({
            name: 'Test Document',
            value: 42,
        });
        createdDocId = docRef.id;
        expect(docRef.id).toBeTruthy();
    });

    it('should retrieve documents from the collection', async () => {
        const querySnapshot = await db.collection(TEST_COLLECTION).get();
        expect(querySnapshot.docs.length).toBeGreaterThan(0);
    });

    it('should update a document in the collection', async () => {
        if (!createdDocId) return;
        await db.collection(TEST_COLLECTION).doc(createdDocId).update({ value: 100 });
        const updatedDoc = await db.collection(TEST_COLLECTION).doc(createdDocId).get();
        expect((updatedDoc.data() as any).value).toBe(100);
    });

    it('should delete a document from the collection', async () => {
        if (!createdDocId) return;
        await db.collection(TEST_COLLECTION).doc(createdDocId).delete();
        const deletedDoc = await db.collection(TEST_COLLECTION).doc(createdDocId).get();
        expect(deletedDoc.exists).toBe(false);
        createdDocId = '';
    });
});