import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyByD5D_RUoPbeJ0EAjqBCPz1ZOxsXdilqA",
  // Uses VITE_FIREBASE_AUTH_DOMAIN if provided (e.g., "kshestra.com"), otherwise falls back to the default Firebase domain
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kshestra-website.firebaseapp.com",
  projectId: "kshestra-website",
  storageBucket: "kshestra-website.firebasestorage.app",
  messagingSenderId: "281891847092",
  appId: "1:281891847092:web:1be470bd6463ea70fc10e1",
  measurementId: "G-WWNWV4ZVQS"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export { firebaseConfig };
export default app;
