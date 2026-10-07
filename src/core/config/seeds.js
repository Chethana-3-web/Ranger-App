/**
 * seeds.js – Local test accounts for development.
 *
 * These are checked in the login flow BEFORE any Firebase call,
 * so they work fully offline.
 *
 * Usage: imported by AuthContext to short-circuit Firebase for known test users.
 */

/** @type {Array<{ email: string, password: string, user: object }>} */
export const SEED_USERS = [
  {
    email:    'ranger@yala.lk',
    password: 'Ranger1!',
    user: {
      id:         'RNG-001',
      email:      'ranger@yala.lk',
      role:       'officer',
      isVerified: true,
      fullName:   'Ranger Perera',
      parkId:     'PARK-YALA',
      patrolId:   'PTL-001',
    },
  },
  {
    email:    'ranger2@wilpattu.lk',
    password: 'Ranger1!',
    user: {
      id:         'RNG-002',
      email:      'ranger2@wilpattu.lk',
      role:       'officer',
      isVerified: true,
      fullName:   'Ranger Nimal',
      parkId:     'PARK-WILPATTU',
      patrolId:   'PTL-002',
    },
  },
];
