import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBabEHmcPKTfQviemBtG8MMgxx8wdoTSSc",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "beprojects-836d6.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "beprojects-836d6",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "beprojects-836d6.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "221105450106",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:221105450106:web:e7ff6a745c533a145d5fc3",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-5KD1KX4SMZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
