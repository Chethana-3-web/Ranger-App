/**
 * Firebase configuration – ranger-app-b7637
 * Firestore in test mode (open rules until 2026-10-29)
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

// Guard against double-initialisation in fast-refresh
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const db = getFirestore(app);
export default app;
