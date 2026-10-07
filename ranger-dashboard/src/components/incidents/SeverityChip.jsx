
const SEV_STYLE = {
  Critical: { bg: '#dc2626', text: '#fff' },
  High:     { bg: '#fee2e2', text: '#991b1b' },
  Medium:   { bg: '#fef9c3', text: '#92400e' },
  Low:      { bg: '#dcfce7', text: '#15803d' },
  Unknown:  { bg: '#f3f4f6', text: '#4b5563' },
};

/** SeverityChip ΓÇô coloured badge for an incident severity. */
export default function SeverityChip({ severity }) {
  const sev = SEV_STYLE[severity] ?? SEV_STYLE.Unknown;
  return (
    <span style={{ ...styles.chip, background: sev.bg, color: sev.text }}>
      {severity ?? 'Unknown'}
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
