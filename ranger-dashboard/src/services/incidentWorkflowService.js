/**
 * incidentWorkflowService.js — Manager workflow for incidents.
 *
 * The mobile app uploads each incident with a PATCH that replaces the whole
 * 'incidents' document, and its `status` field holds the sync state. So the
 * manager's decisions (workflow status, severity, assigned ranger) are kept in
 * a separate collection, 'incident_workflow/{incidentId}', and merged over the
 * incident when it is displayed:
 * {
 *   workflowStatus, severity, assignedRangerId, updatedAt,
 *   history: [{ at, change }]
 * }
 */

import { collection, doc, onSnapshot, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase.js';

const COLLECTION = 'incident_workflow';
const SAVE_TIMEOUT_MS = 8000;

export const WORKFLOW_STEPS = ['New', 'Under Review', 'Assigned', 'Responding', 'Resolved'];
export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

/**
 * Subscribe to all incident workflow records.
 * Calls `callback` with a map keyed by incident id, then on every change.
 *
 * @param {(result: { data: object, error: string | null }) => void} callback
 * @returns {() => void} unsubscribe function — call on component unmount
 */
export function subscribeToIncidentWorkflow(callback) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snapshot) => {
      const byId = {};
      snapshot.docs.forEach((d) => { byId[d.id] = d.data(); });
      callback({ data: byId, error: null });
    },
    (error) => {
      console.error('[incidentWorkflowService] Firestore error:', error);
      callback({ data: {}, error: error.message });
    },
  );
}

/**
 * Save workflow changes for one incident and record them in its history.
 * Rejects if the server does not confirm the write in time.
 *
 * @param {string} incidentId
 * @param {{ workflowStatus?: string, severity?: string, assignedRangerId?: string | null }} changes
 * @param {string} note - human-readable description for the history list
 * @returns {Promise<void>}
 */
export function updateIncidentWorkflow(incidentId, changes, note) {
  const at = new Date().toISOString();
  const write = setDoc(
    doc(db, COLLECTION, incidentId),
    { ...changes, updatedAt: at, history: arrayUnion({ at, change: note }) },
    { merge: true },
  );
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Could not reach the server.')), SAVE_TIMEOUT_MS);
  });
  return Promise.race([write, timeout]);
}

/**
 * Merge a workflow record over an incident.
 * Order: workflow record → values already on the incident (mock data) → defaults.
 *
 * @param {object} incident
 * @param {object} [workflow]
 * @returns {object}
 */
export function mergeWorkflow(incident, workflow) {
  const ownStatus = WORKFLOW_STEPS.includes(incident.status) ? incident.status : 'New';
  return {
    ...incident,
    workflowStatus:   workflow?.workflowStatus ?? ownStatus,
    severity:         workflow?.severity ?? incident.severity ?? 'Unknown',
    assignedRangerId: workflow?.assignedRangerId ?? incident.assignedRangerId ?? null,
    reportedBy:       incident.reportedBy ?? incident.rangerId ?? null,
    reportedAt:       incident.reportedAt ?? incident.recordedAt ?? null,
    history:          workflow?.history ?? [],
  };
}
