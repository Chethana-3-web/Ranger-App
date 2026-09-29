/**
 * mockData.js — Shared mock data for the Wildlife Conservation Dashboard.
 *
 * Single source of truth for all four team members.
 * Coordinates are approximate prototype locations — NOT real-time positions.
 * Data models mirror the Ranger mobile app (ranger-app) domain objects
 * so they can be replaced with real Firebase/API calls later.
 *
 * Parks match ranger-app/src/core/config/parks.js:
 *   PARK-YALA, PARK-SINHARAJA, PARK-UDAWALAWE
 *   + PARK-WILPATTU added for dashboard breadth.
 */

// ─── PARKS ────────────────────────────────────────────────────────────────────

export const PARKS = [
  {
    id: 'PARK-YALA',
    name: 'Yala National Park',
    shortName: 'Yala',
    centre: { lat: 6.3728, lng: 81.5198 },
    zoom: 12,
    area: '979 km²',
    region: 'Southern Province',
  },
  {
    id: 'PARK-WILPATTU',
    name: 'Wilpattu National Park',
    shortName: 'Wilpattu',
    centre: { lat: 8.4594, lng: 80.0417 },
    zoom: 12,
    area: '1,317 km²',
    region: 'North Western Province',
  },
  {
    id: 'PARK-UDAWALAWE',
    name: 'Udawalawe National Park',
    shortName: 'Udawalawe',
    centre: { lat: 6.4745, lng: 80.8998 },
    zoom: 12,
    area: '308 km²',
    region: 'Sabaragamuwa / Southern Province',
  },
  {
    id: 'PARK-SINHARAJA',
    name: 'Sinharaja Forest Reserve',
    shortName: 'Sinharaja',
    centre: { lat: 6.4052, lng: 80.4881 },
    zoom: 13,
    area: '88 km²',
    region: 'Sabaragamuwa Province',
  },
];

// ─── RANGERS ──────────────────────────────────────────────────────────────────

export const RANGERS = [
  {
    id: 'R001',
    name: 'Ranger Kasun Perera',
    parkId: 'PARK-YALA',
    status: 'On Patrol',
    latitude: 6.4021,
    longitude: 81.5312,
    patrolRouteId: 'PAT-001',
    lastUpdated: '2 min ago',
    syncStatus: 'synced',
    battery: 78,
    contact: '+94 77 123 4501',
  },
  {
    id: 'R002',
    name: 'Ranger Nuwan Silva',
    parkId: 'PARK-YALA',
    status: 'On Patrol',
    latitude: 6.3580,
    longitude: 81.5090,
    patrolRouteId: 'PAT-002',
    lastUpdated: '5 min ago',
    syncStatus: 'synced',
    battery: 91,
    contact: '+94 77 123 4502',
  },
  {
    id: 'R003',
    name: 'Ranger Pradeep Fernando',
    parkId: 'PARK-YALA',
    status: 'Available',
    latitude: 6.3728,
    longitude: 81.5198,
    patrolRouteId: null,
    lastUpdated: '1 min ago',
    syncStatus: 'synced',
    battery: 55,
    contact: '+94 77 123 4503',
  },
  {
    id: 'R004',
    name: 'Ranger Chaminda Ranasinghe',
    parkId: 'PARK-WILPATTU',
    status: 'On Patrol',
    latitude: 8.4710,
    longitude: 80.0520,
    patrolRouteId: 'PAT-003',
    lastUpdated: '8 min ago',
    syncStatus: 'pending',
    battery: 62,
    contact: '+94 77 123 4504',
  },
  {
    id: 'R005',
    name: 'Ranger Suresh Wijesinghe',
    parkId: 'PARK-WILPATTU',
    status: 'Offline',
    latitude: 8.4480,
    longitude: 80.0300,
    patrolRouteId: null,
    lastUpdated: '18 min ago',
    syncStatus: 'offline',
    battery: 23,
    contact: '+94 77 123 4505',
  },
  {
    id: 'R006',
    name: 'Ranger Asanka Jayawardena',
    parkId: 'PARK-UDAWALAWE',
    status: 'On Patrol',
    latitude: 6.4890,
    longitude: 80.9120,
    patrolRouteId: 'PAT-004',
    lastUpdated: '3 min ago',
    syncStatus: 'synced',
    battery: 84,
    contact: '+94 77 123 4506',
  },
  {
    id: 'R007',
    name: 'Ranger Tharaka Bandara',
    parkId: 'PARK-UDAWALAWE',
    status: 'Available',
    latitude: 6.4600,
    longitude: 80.8900,
    patrolRouteId: null,
    lastUpdated: '4 min ago',
    syncStatus: 'synced',
    battery: 70,
    contact: '+94 77 123 4507',
  },
  {
    id: 'R008',
    name: 'Ranger Dilshan Pathirana',
    parkId: 'PARK-SINHARAJA',
    status: 'On Patrol',
    latitude: 6.4120,
    longitude: 80.4950,
    patrolRouteId: 'PAT-005',
    lastUpdated: '6 min ago',
    syncStatus: 'synced',
    battery: 67,
    contact: '+94 77 123 4508',
  },
];

// ─── PATROL ROUTES ────────────────────────────────────────────────────────────

export const PATROL_ROUTES = [
  {
    id: 'PAT-001',
    parkId: 'PARK-YALA',
    rangerId: 'R001',
    routeName: 'Yala Sector A – North Loop',
    status: 'Active',
    startTime: '06:30',
    expectedEndTime: '13:30',
    coverage: 68,
    coordinates: [
      [6.3850, 81.5150],
      [6.3920, 81.5220],
      [6.4010, 81.5310],
      [6.4100, 81.5380],
      [6.4200, 81.5420],
      [6.4021, 81.5312],
    ],
  },
  {
    id: 'PAT-002',
    parkId: 'PARK-YALA',
    rangerId: 'R002',
    routeName: 'Yala Sector B – Lagoon Perimeter',
    status: 'Active',
    startTime: '07:00',
    expectedEndTime: '14:00',
    coverage: 45,
    coordinates: [
      [6.3728, 81.5198],
      [6.3650, 81.5100],
      [6.3580, 81.5090],
      [6.3500, 81.5050],
      [6.3450, 81.5120],
    ],
  },
  {
    id: 'PAT-003',
    parkId: 'PARK-WILPATTU',
    rangerId: 'R004',
    routeName: 'Wilpattu East Circuit',
    status: 'Active',
    startTime: '05:45',
    expectedEndTime: '12:45',
    coverage: 72,
    coordinates: [
      [8.4594, 80.0417],
      [8.4650, 80.0480],
      [8.4710, 80.0520],
      [8.4780, 80.0560],
      [8.4820, 80.0610],
    ],
  },
  {
    id: 'PAT-004',
    parkId: 'PARK-UDAWALAWE',
    rangerId: 'R006',
    routeName: 'Udawalawe Reservoir Patrol',
    status: 'Active',
    startTime: '06:00',
    expectedEndTime: '11:00',
    coverage: 81,
    coordinates: [
      [6.4745, 80.8998],
      [6.4800, 80.9060],
      [6.4890, 80.9120],
      [6.4950, 80.9180],
      [6.5020, 80.9210],
    ],
  },
  {
    id: 'PAT-005',
    parkId: 'PARK-SINHARAJA',
    rangerId: 'R008',
    routeName: 'Sinharaja Core Zone Trail',
    status: 'Active',
    startTime: '06:15',
    expectedEndTime: '13:00',
    coverage: 54,
    coordinates: [
      [6.4052, 80.4881],
      [6.4080, 80.4910],
      [6.4120, 80.4950],
      [6.4150, 80.4990],
      [6.4180, 80.5030],
    ],
  },
  {
    id: 'PAT-006',
    parkId: 'PARK-YALA',
    rangerId: 'R001',
    routeName: 'Yala Sector C – Completed',
    status: 'Completed',
    startTime: '05:00',
    expectedEndTime: '11:00',
    coverage: 100,
    coordinates: [
      [6.3300, 81.4900],
      [6.3380, 81.4980],
      [6.3450, 81.5050],
      [6.3520, 81.5110],
    ],
  },
  {
    id: 'PAT-007',
    parkId: 'PARK-WILPATTU',
    rangerId: 'R005',
    routeName: 'Wilpattu West Boundary',
    status: 'Offline',
    startTime: '07:00',
    expectedEndTime: '14:00',
    coverage: 30,
    coordinates: [
      [8.4400, 79.9900],
      [8.4480, 80.0300],
      [8.4520, 80.0200],
    ],
  },
];

// ─── INCIDENTS ────────────────────────────────────────────────────────────────

export const INCIDENTS = [
  {
    id: 'INC-001',
    type: 'SNARE',
    label: 'Snare / Trap',
    parkId: 'PARK-YALA',
    latitude: 6.3990,
    longitude: 81.5280,
    severity: 'High',
    status: 'New',
    reportedBy: 'R001',
    reportedAt: '2026-09-29T07:14:00',
    description: 'Wire snare found near the northern watering hole.',
  },
  {
    id: 'INC-002',
    type: 'CARCASS',
    label: 'Animal Carcass',
    parkId: 'PARK-YALA',
    latitude: 6.3650,
    longitude: 81.5120,
    severity: 'Critical',
    status: 'Under Review',
    reportedBy: 'R002',
    reportedAt: '2026-09-29T06:55:00',
    description: 'Leopard carcass found near sector B lagoon.',
  },
  {
    id: 'INC-003',
    type: 'CAMPSITE',
    label: 'Illegal Campsite',
    parkId: 'PARK-WILPATTU',
    latitude: 8.4720,
    longitude: 80.0490,
    severity: 'Medium',
    status: 'Assigned',
    reportedBy: 'R004',
    reportedAt: '2026-09-29T07:30:00',
    description: 'Abandoned illegal campsite with fire remains.',
  },
  {
    id: 'INC-004',
    type: 'TRACKS',
    label: 'Animal Tracks',
    parkId: 'PARK-UDAWALAWE',
    latitude: 6.4870,
    longitude: 80.9100,
    severity: 'Low',
    status: 'Resolved',
    reportedBy: 'R006',
    reportedAt: '2026-09-28T14:20:00',
    description: 'Elephant tracks crossing into adjacent farmland.',
  },
  {
    id: 'INC-005',
    type: 'SNARE',
    label: 'Snare / Trap',
    parkId: 'PARK-SINHARAJA',
    latitude: 6.4095,
    longitude: 80.4870,
    severity: 'High',
    status: 'New',
    reportedBy: 'R008',
    reportedAt: '2026-09-29T08:10:00',
    description: 'Rope snare targeting small mammals near trail junction.',
  },
  {
    id: 'INC-006',
    type: 'OTHER',
    label: 'Human-Wildlife Conflict',
    parkId: 'PARK-WILPATTU',
    latitude: 8.4500,
    longitude: 80.0350,
    severity: 'Critical',
    status: 'Responding',
    reportedBy: 'R005',
    reportedAt: '2026-09-29T05:50:00',
    description: 'Elephant entered village boundary, crops damaged.',
  },
];

// ─── WILDLIFE (Collared Animals) ──────────────────────────────────────────────

export const WILDLIFE = [
  {
    id: 'WL-E101',
    species: 'Sri Lankan Elephant',
    name: 'Elephant E-101',
    parkId: 'PARK-YALA',
    latitude: 6.3800,
    longitude: 81.5050,
    status: 'Active',
    collarId: 'COL-101',
    lastUpdate: '4 min ago',
    zone: 'Zone A-03',
  },
  {
    id: 'WL-E102',
    species: 'Sri Lankan Elephant',
    name: 'Elephant E-102',
    parkId: 'PARK-UDAWALAWE',
    latitude: 6.4950,
    longitude: 80.9050,
    status: 'Alert',
    collarId: 'COL-102',
    lastUpdate: '2 min ago',
    zone: 'Zone B-12 (near farmland)',
  },
  {
    id: 'WL-L001',
    species: 'Sri Lankan Leopard',
    name: 'Leopard L-001',
    parkId: 'PARK-YALA',
    latitude: 6.3620,
    longitude: 81.5180,
    status: 'Active',
    collarId: 'COL-201',
    lastUpdate: '11 min ago',
    zone: 'Zone C-07',
  },
  {
    id: 'WL-E103',
    species: 'Sri Lankan Elephant',
    name: 'Elephant E-103',
    parkId: 'PARK-WILPATTU',
    latitude: 8.4560,
    longitude: 80.0390,
    status: 'Active',
    collarId: 'COL-103',
    lastUpdate: '7 min ago',
    zone: 'Zone W-02',
  },
];

// ─── RISK ZONES ───────────────────────────────────────────────────────────────

export const RISK_ZONES = [
  {
    id: 'RZ-001',
    name: 'Poaching Hotspot – North Yala',
    parkId: 'PARK-YALA',
    type: 'Poaching Hotspot',
    riskLevel: 'High',
    centre: { lat: 6.4150, lng: 81.5400 },
    radius: 1200,
    color: '#dc2626',
  },
  {
    id: 'RZ-002',
    name: 'Village Boundary – East Wilpattu',
    parkId: 'PARK-WILPATTU',
    type: 'Village Boundary',
    riskLevel: 'Medium',
    centre: { lat: 8.4820, lng: 80.0600 },
    radius: 900,
    color: '#f59e0b',
  },
  {
    id: 'RZ-003',
    name: 'Farmland Conflict Zone – Udawalawe',
    parkId: 'PARK-UDAWALAWE',
    type: 'Farmland',
    riskLevel: 'High',
    centre: { lat: 6.5050, lng: 80.9250 },
    radius: 1000,
    color: '#dc2626',
  },
  {
    id: 'RZ-004',
    name: 'Road Crossing – Sinharaja Buffer',
    parkId: 'PARK-SINHARAJA',
    type: 'Road Crossing',
    riskLevel: 'Low',
    centre: { lat: 6.4000, lng: 80.4820 },
    radius: 600,
    color: '#16a34a',
  },
];

// ─── COMMUNITY REPORTS (stub for Member 3) ────────────────────────────────────

export const COMMUNITY_REPORTS = [
  { id: 'CR-001', type: 'Elephant Sighting',  parkId: 'PARK-UDAWALAWE', location: 'Hambantota Road, near Suriyawewa', latitude: 6.5100, longitude: 80.9350, date: '2026-09-29', priority: 'High',   status: 'Pending',   reportedBy: 'Community Member' },
  { id: 'CR-002', type: 'Crop Damage',        parkId: 'PARK-WILPATTU',  location: 'Mannar District, Medawachchiya',  latitude: 8.5000, longitude: 80.0700, date: '2026-09-28', priority: 'Medium', status: 'Assigned',  reportedBy: 'Farmer Dissanayake' },
  { id: 'CR-003', type: 'Injured Wildlife',   parkId: 'PARK-YALA',      location: 'Near Yala Block 1 entrance',     latitude: 6.3400, longitude: 81.5000, date: '2026-09-29', priority: 'Critical',status: 'Responding',reportedBy: 'Tourist Guide Mahesh' },
];

// ─── WILDLIFE ALERTS (stub for Member 4) ─────────────────────────────────────

export const WILDLIFE_ALERTS = [
  { id: 'ALT-001', type: 'Elephant Entered Farmland',  animalId: 'WL-E102', parkId: 'PARK-UDAWALAWE', riskLevel: 'High',     time: '10:42', date: '2026-09-29', status: 'Active',    location: 'Farmland Zone F-04',         latitude: 6.5050, longitude: 80.9250 },
  { id: 'ALT-002', type: 'Elephant Approaching Road',  animalId: 'WL-E103', parkId: 'PARK-WILPATTU',  riskLevel: 'Medium',   time: '09:15', date: '2026-09-29', status: 'Monitoring',location: 'A12 Highway Crossing Point', latitude: 8.4820, longitude: 80.0600 },
  { id: 'ALT-003', type: 'Possible Poaching Activity', animalId: null,      parkId: 'PARK-YALA',      riskLevel: 'Critical', time: '07:05', date: '2026-09-29', status: 'Active',    location: 'North Yala Sector A',        latitude: 6.4150, longitude: 81.5400 },
];

// ─── SYNC STATUS ──────────────────────────────────────────────────────────────

export const SYNC_STATUS = {
  online: true,
  lastSynced: '—',
  pendingRecords: 0,
  // Note: dashboard topbar uses live SyncContext from useFirestoreIncidents,
  // not this static value. This is kept for reference only.
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export const getParkById       = (id)     => PARKS.find((p) => p.id === id);
export const getRangerById     = (id)     => RANGERS.find((r) => r.id === id);

export const getRangersByPark  = (parkId) =>
  (!parkId || parkId === 'ALL') ? RANGERS : RANGERS.filter((r) => r.parkId === parkId);

export const getPatrolsByPark  = (parkId) =>
  (!parkId || parkId === 'ALL') ? PATROL_ROUTES : PATROL_ROUTES.filter((p) => p.parkId === parkId);

export const getIncidentsByPark = (parkId) =>
  (!parkId || parkId === 'ALL') ? INCIDENTS : INCIDENTS.filter((i) => i.parkId === parkId);

export const getWildlifeByPark = (parkId) =>
  (!parkId || parkId === 'ALL') ? WILDLIFE : WILDLIFE.filter((w) => w.parkId === parkId);

export const getRiskZonesByPark = (parkId) =>
  (!parkId || parkId === 'ALL') ? RISK_ZONES : RISK_ZONES.filter((z) => z.parkId === parkId);

/** Derive patrol summary stats from mock data */
export function getPatrolSummary(parkId) {
  const rangers = getRangersByPark(parkId);
  const patrols = getPatrolsByPark(parkId);
  return {
    activePatrols:    patrols.filter((p) => p.status === 'Active').length,
    completedToday:   patrols.filter((p) => p.status === 'Completed').length,
    rangersOnPatrol:  rangers.filter((r) => r.status === 'On Patrol').length,
    rangersAvailable: rangers.filter((r) => r.status === 'Available').length,
    rangersOffline:   rangers.filter((r) => r.status === 'Offline').length,
    totalRangers:     rangers.length,
  };
}
