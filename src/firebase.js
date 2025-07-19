import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAFyYd9QVoDQ6OImHvWseP338uj1QZqsNk",
  authDomain: "journalsnap.firebaseapp.com",
  projectId: "journalsnap",
  storageBucket: "journalsnap.firebasestorage.app",
  messagingSenderId: "898809463880",
  appId: "1:898809463880:web:452b781440df246336c47d",
  measurementId: "G-895018T869"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };