import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDeOY1jaWD261wEPNjLLUZ2qIWGpax2jlg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'zootra-61405.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'zootra-61405',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'zootra-61405.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '366720451193',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:366720451193:web:c867a57c67a574d6468aa8',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
