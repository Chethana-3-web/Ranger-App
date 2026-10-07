import { Check } from 'lucide-react';
import { WORKFLOW_STEPS } from '../../services/incidentWorkflowService.js';

/**
 * WorkflowTracker ΓÇô shows the incident workflow as a row of steps:
 * New ΓåÆ Under Review ΓåÆ Assigned ΓåÆ Responding ΓåÆ Resolved.
 *
 * @param {{ status: string }} props
 */
export default function WorkflowTracker({ status }) {
  const current = WORKFLOW_STEPS.indexOf(status);

  return (
    <ol style={styles.row}>
      {WORKFLOW_STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} style={styles.step} aria-current={active ? 'step' : undefined}>
            <span
              style={{
                ...styles.dot,
                background: done || active ? 'var(--color-primary-mid)' : '#fff',
                borderColor: done || active ? 'var(--color-primary-mid)' : 'var(--color-border)',
                color: done || active ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {done ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span
              style={{
                ...styles.label,
                fontWeight: active ? 700 : 500,
                color: done || active ? 'var(--color-text)' : 'var(--color-text-secondary)',
              }}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const styles = {
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    listStyle: 'none',
  },
  step: {
    flex: '1 1 90px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    textAlign: 'center',
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.72rem',
    fontWeight: 700,
  },
  label: {
    fontSize: '0.75rem',
  },
};
