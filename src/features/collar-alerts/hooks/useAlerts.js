/**
 * useAlerts – subscribes to collar alerts from Firestore.
 * Returns { alerts, loading, error, isOffline }.
 */

import { useState, useEffect } from 'react';
import { subscribeToAlerts } from '../services/alertService';

export function useAlerts() {
  const [alerts,   setAlerts]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const unsub = subscribeToAlerts(({ data, error: err, loading: ld }) => {
      setAlerts(data);
      setError(err);
      setLoading(ld);
    });
    return unsub;
  }, []);

  return { alerts, loading, error, isOffline: !!error };
}
