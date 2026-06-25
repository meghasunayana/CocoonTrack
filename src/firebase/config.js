// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLtAXzVjGMbywX7Fil-ey13tZWsUMkGPs",
  authDomain: "cocoontrack.firebaseapp.com",
  projectId: "cocoontrack",
  storageBucket: "cocoontrack.firebasestorage.app",
  messagingSenderId: "342282755761",
  appId: "1:342282755761:web:6685e2e85d1a9fccdacc90",
  measurementId: "G-5KM5VBV8VG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
