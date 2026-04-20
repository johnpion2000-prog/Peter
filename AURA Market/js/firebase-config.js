// ===== Firebase Configuration =====
// Replace with your own Firebase project config from Firebase Console
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRJqChXYyy7yScveQfhaL2dRxtUzgzX3w",
  authDomain: "petfoodmarket-b323a.firebaseapp.com",
  projectId: "petfoodmarket-b323a",
  storageBucket: "petfoodmarket-b323a.firebasestorage.app",
  messagingSenderId: "560335129775",
  appId: "1:560335129775:web:982eb9c7a20ef0f85d585a",
  measurementId: "G-VZ3C4XH3MF"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
