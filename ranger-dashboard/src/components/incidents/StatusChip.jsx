
const STATUS_STYLE = {
  'New':          { bg: '#dbeafe', text: '#1d4ed8' },
  'Under Review': { bg: '#ede9fe', text: '#6d28d9' },
  'Assigned':     { bg: '#fef9c3', text: '#92400e' },
  'Responding':   { bg: '#ffedd5', text: '#c2410c' },
  'Resolved':     { bg: '#dcfce7', text: '#15803d' },
};

/** StatusChip ΓÇô coloured badge for an incident workflow status. */
export default function StatusChip({ status }) {
  const st = STATUS_STYLE[status] ?? { bg: '#f3f4f6', text: '#4b5563' };
  return (
    <span style={{ ...styles.chip, background: st.bg, color: st.text }}>
      {status}
    </span>
  );
}

const styles = {
  chip: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: '0.72rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
};
