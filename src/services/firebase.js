/**
 * firebase.js — Dashboard Firebase initialisation.
 *
 * Connects to the same Firestore project used by the Ranger mobile app
 * (ranger-app-b7637). Config mirrors ranger-app/src/firebase/firebaseConfig.js.
 *
 * The web dashboard uses the Firebase JS SDK directly — no polyfills needed
 * (unlike Expo Go which needed the REST workaround).
 *
 * Firestore rules: open test mode until 2026-10-29 (no auth required).
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyBiD5QOG8QUJPeVxFnByPhmxsvGiltAGGQ',
  authDomain:        'ranger-app-b7637.firebaseapp.com',
  projectId:         'ranger-app-b7637',
  storageBucket:     'ranger-app-b7637.firebasestorage.app',
  messagingSenderId: '654015693659',
  appId:             '1:654015693659:web:8fe087ba8fb92b621a907e',
};

// Guard against double-initialisation (e.g. HMR during development)
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const db = getFirestore(app);
export default app;
