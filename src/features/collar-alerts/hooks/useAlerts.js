/**
 * useAlerts – subscribes to collar alerts from Firestore.
 * Fires a local push notification when a new alert arrives.
 * Returns { alerts, loading, error, isOffline }.
 */

import { useState, useEffect, useRef } from 'react';
import { subscribeToAlerts } from '../services/alertService';
import { showAlertNotification } from '../services/notificationService';

export function useAlerts(refreshKey = 0) {
  const [alerts,   setAlerts]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  // Track known alert IDs so we only notify on genuinely new ones
  const knownIds = useRef(null);

  useEffect(() => {
    const unsub = subscribeToAlerts(({ data, error: err, loading: ld }) => {
      setAlerts(data);
      setError(err);
      setLoading(ld);

      if (!ld && !err) {
        if (knownIds.current === null) {
          // First load — just record existing IDs, don't notify
          knownIds.current = new Set(data.map((a) => a.id));
        } else {
          // Check for new alerts not seen before
          data.forEach((alert) => {
            if (!knownIds.current.has(alert.id)) {
              knownIds.current.add(alert.id);
              showAlertNotification(alert).catch(() => {});
            }
          });
        }
      }
    });
    return unsub;
  }, [refreshKey]);

  return { alerts, loading, error, isOffline: !!error };
}
