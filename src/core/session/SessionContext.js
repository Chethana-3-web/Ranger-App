/**
 * Ranger App – Session Context
 *
 * Provides a seeded (no-login) ranger session to the entire application.
 * There is intentionally no authentication flow – a fixed ranger and patrol
 * are injected at startup for this prototype.
 *
 * Seeded data:
 *   ranger  – { id, name, parkId, role }
 *   patrol  – { id, rangerId, parkId, startedAt, status }
 *
 * Usage:
 *   const { ranger, patrol } = useSession();
 */

import React, { createContext, useContext } from 'react';

/** @type {{ id: string, name: string, parkId: string, role: string }} */
const SEEDED_RANGER = {
  id:     'RNG-001',
  name:   'Ranger Perera',
  parkId: 'PARK-YALA',
  role:   'ranger',
};

/** @type {{ id: string, rangerId: string, parkId: string, startedAt: string, status: string }} */
const SEEDED_PATROL = {
  id:        'PTL-001',
  rangerId:  'RNG-001',
  parkId:    'PARK-YALA',
  startedAt: '2026-09-21T06:00:00.000Z',
  status:    'ACTIVE',
};

const SessionContext = createContext(null);

/**
 * SessionProvider – wraps the app and injects the seeded session.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const SessionProvider = ({ children }) => {
  const value = {
    ranger: SEEDED_RANGER,
    patrol: SEEDED_PATROL,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

/**
 * useSession – access the seeded ranger session.
 *
 * Must be used inside a SessionProvider.
 *
 * @returns {{ ranger: object, patrol: object }}
 */
export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
};

export default SessionContext;
