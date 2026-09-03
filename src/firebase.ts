import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// CRITICAL FIX: The authDomain MUST be the authentic Firebase Auth handler domain
// (kshestra-website.firebaseapp.com).
// If set to a custom website domain (such as kshestra.com), the OAuth popup navigates
// to the SPA website instead of the Firebase Google Sign-In handler, causing the website
// to open inside the popup instead of authenticating the user.
const rawAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const verifiedAuthDomain = (rawAuthDomain && rawAuthDomain.includes('.firebaseapp.com'))
  ? rawAuthDomain
  : "kshestra-website.firebaseapp.com";

const firebaseConfig = {
  apiKey: "AIzaSyByD5D_RUoPbeJ0EAjqBCPz1ZOxsXdilqA",
  authDomain: verifiedAuthDomain,
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
