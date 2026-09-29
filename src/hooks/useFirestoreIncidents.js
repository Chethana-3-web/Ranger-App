/**
 * useFirestoreIncidents — React hook for live Firestore incident data.
 *
 * Returns { incidents, loading, error, syncStatus }.
 *
 * - While the first snapshot hasn't arrived: loading = true
 * - Once data arrives: loading = false, incidents = normalised array
 * - If Firestore is unreachable: error is set, falls back to mockData
 *
 * The `syncStatus` object is compatible with SyncStatusChip:
 *   { online, lastSynced, pendingRecords }
 */

import { useState, useEffect, useRef } from 'react';
import { subscribeToIncidents } from '../services/incidentService.js';
import { INCIDENTS as MOCK_INCIDENTS } from '../data/mockData.js';

export function useFirestoreIncidents() {
  const [incidents,   setIncidents]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastSynced,  setLastSynced]  = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const unsub = subscribeToIncidents(({ data, error: err, loading: ld }) => {
      if (!mountedRef.current) return;

      if (err) {
        setError(err);
        setLoading(false);
        // Fall back to mock data so the map isn't empty
        setIncidents(MOCK_INCIDENTS);
        return;
      }

      setError(null);
      setLoading(ld);

      // Use live data if Firestore returned any documents, else fall back to mock
      setIncidents(data.length > 0 ? data : MOCK_INCIDENTS);
      setLastSynced(new Date().toLocaleTimeString());
    });

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, []);

  // Build a SyncStatusChip-compatible status object
  const syncStatus = {
    online:         error === null,
    lastSynced:     lastSynced ? `at ${lastSynced}` : 'connecting…',
    pendingRecords: 0,
    source:         error ? 'mock (offline fallback)' : 'Firestore',
  };

  return { incidents, loading, error, syncStatus };
}
