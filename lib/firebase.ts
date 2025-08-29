import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5lMUqPcqpi7fYapJBPHE6u9fLvx2IzNM",
  authDomain: "mentorapp-87d09.firebaseapp.com",
  projectId: "mentorapp-87d09",
  storageBucket: "mentorapp-87d09.firebasestorage.app",
  messagingSenderId: "6288405218",
  appId: "1:6288405218:web:d0d6aadecbc03b5b63e4bb",
  measurementId: "G-PWEQDE7HTV"
  
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);