/**
 * Tests for incidentService.js
 * Naming: <method>_<condition>_<expectedResult>
 * Covers: main flow, A1/A2/A3, E1, E3, E4, local-first guarantee,
 *         ranger/patrol/park link, precondition failures
 */

import {
  logIncident,
  saveDraft,
  findDraft,
  discardDraft,
  getTypesForPark,
} from '../incidentService';
import { ValidationError, StorageError } from '../../../../core/domain/errors';
import { SyncStatus } from '../../domain/syncStatus';
import { createDraft, updateDraftStep, DraftStep } from '../../domain/draft';

// ── Fakes ─────────────────────────────────────────────────────────────────────

function makeIncidentRepo(overrides = {}) {
  const store = new Map();
  return {
    async save(incident)       { store.set(incident.id, incident); },
    async findById(id)         { return store.get(id) ?? null; },
    async findByStatus(status) { return [...store.values()].filter((i) => i.status === status); },
    async findAll()            { return [...store.values()]; },
    async update(incident)     { store.set(incident.id, incident); },
    _store: store,
    ...overrides,
  };
}

function makeDraftRepo() {
  let draft = null;
  return {
    async save(d) { draft = d; },
    async find()  { return draft; },
    async delete(){ draft = null; },
    _get: () => draft,
  };
}

function makeGateway(result = 'STORED', error = null) {
  return {
    async upload(_incident) {
      if (result === 'THROW') throw new Error('Network failure');
      return { result, error };
    },
    uploadedIds: [],
  };
}

const fakeClock = {
  now: () => 1_000_000,
  iso: () => '2026-09-22T10:00:00.000Z',
};

let idCounter = 0;
const fakeIdGen = { generate: async () => `fake-${++idCounter}` };

const onlineMonitor  = { isOnline: () => true };
const offlineMonitor = { isOnline: () => false };

const YALA_PARK = {
  id: 'PARK-YALA',
  enabledIncidentTypes: ['SNARE', 'CARCASS', 'TRACKS', 'CAMPSITE', 'OTHER'],
};

const VALID_LOCATION = {
  latitude: 6.37, longitude: 81.52,
  source: 'GPS', accuracyMeters: 5,
  capturedAt: '2026-09-22T09:00:00.000Z',
};

function makeBaseParams(overrides = {}) {
  return {
    type:        'SNARE',
    description: 'Found a wire snare near the waterhole.',
    location:    VALID_LOCATION,
    photoUri:    null,
    rangerId:    'RNG-001',
    patrolId:    'PTL-001',
    parkId:      'PARK-YALA',
    park:        YALA_PARK,
    incidentRepo:        makeIncidentRepo(),
    gateway:             makeGateway('STORED'),
    connectivityMonitor: onlineMonitor,
    clock:               fakeClock,
    idGenerator:         fakeIdGen,
    ...overrides,
  };
}

beforeEach(() => { idCounter = 0; });

// ── logIncident – main flow ────────────────────────────────────────────────────

describe('logIncident', () => {
  test('logIncident_withValidFieldsAndOnline_returnsSyncedIncident', async () => {
    const incident = await logIncident(makeBaseParams());
    expect(incident.status).toBe(SyncStatus.SYNCED);
    expect(incident.type).toBe('SNARE');
    expect(incident.rangerId).toBe('RNG-001');
  });

  test('logIncident_withValidFieldsAndOffline_returnsPendingSyncIncident', async () => {
    const incident = await logIncident(makeBaseParams({ connectivityMonitor: offlineMonitor }));
    expect(incident.status).toBe(SyncStatus.PENDING_SYNC);
  });

  test('logIncident_withValidFields_persistsIncidentLocally', async () => {
    const repo = makeIncidentRepo();
    await logIncident(makeBaseParams({ incidentRepo: repo }));
    expect(await repo.findAll()).toHaveLength(1);
  });

  test('logIncident_withPhoto_persistsPhotoUri', async () => {
    const incident = await logIncident(makeBaseParams({ photoUri: 'file://photo.jpg' }));
    expect(incident.photoUri).toBe('file://photo.jpg');
  });

  test('logIncident_withDescriptionWhitespace_trimsDescription', async () => {
    const incident = await logIncident(makeBaseParams({ description: '  Found a snare.  ' }));
    expect(incident.description).toBe('Found a snare.');
  });

  test('logIncident_gatewayReturnsAlreadyExists_returnsSyncedIncident', async () => {
    const incident = await logIncident(makeBaseParams({ gateway: makeGateway('ALREADY_EXISTS') }));
    expect(incident.status).toBe(SyncStatus.SYNCED);
  });

  test('logIncident_gatewayReturnsError_returnsPendingWithAttempt', async () => {
    const incident = await logIncident(makeBaseParams({ gateway: makeGateway('ERROR', 'Server down') }));
    expect(incident.status).toBe(SyncStatus.PENDING_SYNC);
    expect(incident.syncAttempts).toBe(1);
    expect(incident.lastError).toBe('Server down');
  });

  test('logIncident_gatewayThrows_returnsPendingWithAttempt', async () => {
    const incident = await logIncident(makeBaseParams({ gateway: makeGateway('THROW') }));
    expect(incident.status).toBe(SyncStatus.PENDING_SYNC);
    expect(incident.syncAttempts).toBe(1);
  });

  // E3 – validation failures
  test('logIncident_withEmptyDescription_throwsValidationError', async () => {
    await expect(logIncident(makeBaseParams({ description: '' }))).rejects.toBeInstanceOf(ValidationError);
  });

  test('logIncident_withNullType_throwsValidationError', async () => {
    await expect(logIncident(makeBaseParams({ type: null }))).rejects.toBeInstanceOf(ValidationError);
  });

  test('logIncident_withTypeNotEnabledForPark_throwsValidationError', async () => {
    const sinhPark = { id: 'PARK-SINHARAJA', enabledIncidentTypes: ['SNARE', 'CAMPSITE'] };
    await expect(
      logIncident(makeBaseParams({ type: 'CARCASS', park: sinhPark })),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  test('logIncident_withNullLocation_throwsValidationError', async () => {
    await expect(logIncident(makeBaseParams({ location: null }))).rejects.toBeInstanceOf(ValidationError);
  });

  test('logIncident_withDescriptionOver500Chars_throwsValidationError', async () => {
    await expect(
      logIncident(makeBaseParams({ description: 'X'.repeat(501) })),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  // E4 – storage failure
  test('logIncident_storageFails_throwsStorageError', async () => {
    const badRepo = makeIncidentRepo({ save: async () => { throw new Error('Disk full'); } });
    await expect(logIncident(makeBaseParams({ incidentRepo: badRepo }))).rejects.toBeInstanceOf(StorageError);
  });

  test('logIncident_storageFails_doesNotAttemptSync', async () => {
    let gatewayCalled = false;
    const badRepo = makeIncidentRepo({ save: async () => { throw new Error('fail'); } });
    const gateway = { upload: async () => { gatewayCalled = true; return { result: 'STORED' }; } };
    try { await logIncident(makeBaseParams({ incidentRepo: badRepo, gateway })); } catch { /* expected */ }
    expect(gatewayCalled).toBe(false);
  });

  // A1 – manual location
  test('logIncident_withManualLocation_succeeds', async () => {
    const manualLoc = { ...VALID_LOCATION, source: 'MANUAL', accuracyMeters: null };
    const incident = await logIncident(makeBaseParams({ location: manualLoc, connectivityMonitor: offlineMonitor }));
    expect(incident.location.source).toBe('MANUAL');
    expect(incident.status).toBe(SyncStatus.PENDING_SYNC);
  });

  // A2 – no photo
  test('logIncident_withNullPhoto_succeedsWithNullPhotoUri', async () => {
    const incident = await logIncident(makeBaseParams({ photoUri: null, connectivityMonitor: offlineMonitor }));
    expect(incident.photoUri).toBeNull();
  });
});

// ── local-first and session-linking guarantees ────────────────────────────────

describe('logIncident – guarantees', () => {
  test('saveIncident_whenOnline_alwaysPersistsLocallyBeforeSyncing', async () => {
    // Arrange – repo intercepts save; gateway tracks call order
    const saveOrder = [];
    const repo = makeIncidentRepo({
      save: async (incident) => {
        saveOrder.push('local');
        repo._store.set(incident.id, incident);
      },
      update: async (incident) => { repo._store.set(incident.id, incident); },
    });
    const gateway = {
      upload: async () => { saveOrder.push('remote'); return { result: 'STORED' }; },
    };

    // Act
    await logIncident(makeBaseParams({ incidentRepo: repo, gateway, connectivityMonitor: onlineMonitor }));

    // Assert – local save must precede remote call
    expect(saveOrder[0]).toBe('local');
    expect(saveOrder[1]).toBe('remote');
    expect(await repo.findAll()).toHaveLength(1);
  });

  test('logIncident_always_linksIncidentToActiveRangerAndPatrol', async () => {
    // Arrange
    const repo = makeIncidentRepo();

    // Act
    await logIncident(makeBaseParams({
      rangerId: 'RNG-001',
      patrolId: 'PTL-001',
      parkId:   'PARK-YALA',
      incidentRepo: repo,
      connectivityMonitor: offlineMonitor,
    }));

    // Assert
    const all = await repo.findAll();
    expect(all[0].rangerId).toBe('RNG-001');
    expect(all[0].patrolId).toBe('PTL-001');
    expect(all[0].parkId).toBe('PARK-YALA');
  });
});

// ── draft operations ───────────────────────────────────────────────────────────

describe('saveDraft / findDraft / discardDraft', () => {
  const TS = '2026-09-22T09:00:00.000Z';

  test('saveDraft_andFindDraft_returnsSavedDraft', async () => {
    const repo = makeDraftRepo();
    const draft = createDraft(TS);
    await saveDraft(draft, repo);
    expect(await findDraft(repo)).toEqual(draft);
  });

  test('findDraft_whenNoDraftExists_returnsNull', async () => {
    expect(await findDraft(makeDraftRepo())).toBeNull();
  });

  test('discardDraft_afterSave_makesNextFindReturnNull', async () => {
    const repo = makeDraftRepo();
    await saveDraft(createDraft(TS), repo);
    await discardDraft(repo);
    expect(await findDraft(repo)).toBeNull();
  });

  test('saveDraft_updatedDraft_overwritesPreviousDraft', async () => {
    const repo = makeDraftRepo();
    const draft1 = createDraft(TS);
    const draft2 = updateDraftStep(draft1, DraftStep.TYPE, { type: 'SNARE' });
    await saveDraft(draft1, repo);
    await saveDraft(draft2, repo);
    expect((await findDraft(repo)).type).toBe('SNARE');
  });
});

// ── getTypesForPark ────────────────────────────────────────────────────────────

describe('getTypesForPark', () => {
  test('getTypesForPark_yalaPark_returnsAllFiveTypes', () => {
    expect(getTypesForPark(YALA_PARK)).toHaveLength(5);
  });

  test('getTypesForPark_sinharajaPark_returnsSubset', () => {
    const park = { enabledIncidentTypes: ['SNARE', 'CAMPSITE'] };
    expect(getTypesForPark(park).map((t) => t.key)).toEqual(['SNARE', 'CAMPSITE']);
  });
});
