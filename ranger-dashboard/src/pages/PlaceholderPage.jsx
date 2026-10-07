import React from 'react';
import { Construction } from 'lucide-react';

/**
 * PlaceholderPage – stub for other team members' modules.
 * Replace this component with the real implementation.
 */
export default function PlaceholderPage({ title, member }) {
  return (
    <div className="placeholder-page">
      <Construction size={40} color="#9ca3af" />
      <h2>{title}</h2>
      <p style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', maxWidth: 320 }}>
        Assigned to <strong>Member {member}</strong>. Replace this file with the actual page component.
      </p>
    </div>
  );
}
