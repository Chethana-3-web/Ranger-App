/**
 * useRangers ΓÇö live list of verified rangers registered in the mobile app.
 *
 * Returns { rangers, loading, error }, where each ranger is { id, name }.
 *
 * Rangers are the documents in the Firestore 'users' collection with
 * role 'officer' that an admin has verified (see VerifyRangers page).
 */

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../services/firebase.js';

export function useRangers() {
  const [rangers, setRangers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'officer'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        // isVerified is filtered client-side to avoid requiring a composite index
        const verified = snapshot.docs
          .map((d) => d.data())
          .filter((u) => u.isVerified)
          .map((u) => ({ id: u.id, name: u.fullName || u.email || u.id }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setRangers(verified);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('[useRangers] Firestore error:', err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  return { rangers, loading, error };
}
