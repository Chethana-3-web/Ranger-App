/**
 * useIncidents — incidents with the manager workflow merged in.
 *
 * Returns { incidents, loading, error, source }.
 *
 * Incidents come from useFirestoreIncidents (live Firestore, mock fallback).
 * Each one gets workflowStatus, severity, assignedRangerId, reportedBy,
 * reportedAt and history from the 'incident_workflow' collection.
 */

import { useState, useEffect, useMemo } from 'react';
import { useFirestoreIncidents } from './useFirestoreIncidents.js';
import { subscribeToIncidentWorkflow, mergeWorkflow } from '../services/incidentWorkflowService.js';

export function useIncidents() {
  const { incidents: rawIncidents, loading, error, syncStatus } = useFirestoreIncidents();
  const [workflowById, setWorkflowById] = useState({});

  useEffect(() => {
    const unsub = subscribeToIncidentWorkflow(({ data }) => setWorkflowById(data));
    return () => unsub();
  }, []);

  const incidents = useMemo(
    () => rawIncidents.map((inc) => mergeWorkflow(inc, workflowById[inc.id])),
    [rawIncidents, workflowById],
  );

  return { incidents, loading, error, source: syncStatus.source };
}
