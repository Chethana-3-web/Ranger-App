import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAqIqZaZDIafRo064Nb24lhbDU4EffqPWM",
  authDomain: "ranger-abaec.firebaseapp.com",
  projectId: "ranger-abaec",
  storageBucket: "ranger-abaec.firebasestorage.app",
  messagingSenderId: "857666252220",
  appId: "1:857666252220:web:3899ce46f130cfac608fb9",
  measurementId: "G-7CJH298BHJ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Force long polling for React Native to prevent WebSocket hangs
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
