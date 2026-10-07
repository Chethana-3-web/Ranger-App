/**
 * firebase.js ΓÇö Dashboard Firebase initialisation.
 *
 * Connects to the same Firestore project used by the Ranger mobile app
 * (ranger-app-b7637). Config mirrors ranger-app/src/firebase/firebaseConfig.js.
 *
 * The web dashboard uses the Firebase JS SDK directly ΓÇö no polyfills needed
 * (unlike Expo Go which needed the REST workaround).
 *
 * Firestore rules: open test mode until 2026-10-29 (no auth required).
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAqIqZaZDIafRo064Nb24lhbDU4EffqPWM",
  authDomain: "ranger-abaec.firebaseapp.com",
  projectId: "ranger-abaec",
  storageBucket: "ranger-abaec.firebasestorage.app",
  messagingSenderId: "857666252220",
  appId: "1:857666252220:web:3899ce46f130cfac608fb9",
  measurementId: "G-7CJH298BHJ"
};

// Guard against double-initialisation (e.g. HMR during development)
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const db = getFirestore(app);
export default app;
