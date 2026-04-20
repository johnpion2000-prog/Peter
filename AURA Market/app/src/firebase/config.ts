import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDRJqChXYyy7yScveQfhaL2dRxtUzgzX3w',
  authDomain: 'petfoodmarket-b323a.firebaseapp.com',
  projectId: 'petfoodmarket-b323a',
  storageBucket: 'petfoodmarket-b323a.firebasestorage.app',
  messagingSenderId: '560335129775',
  appId: '1:560335129775:web:982eb9c7a20ef0f85d585a',
  measurementId: 'G-VZ3C4XH3MF',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics only in browser environments
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

export default app;
