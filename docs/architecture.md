# Log Patrol Incident – Architecture

## Layers

```
src/features/log-incident/
├── domain/           Pure data + business rules. No I/O, no React.
├── ports/            JSDoc contracts (abstract interfaces).
├── application/      Use-case orchestration. Depends only on ports.
├── infrastructure/   Real implementations of ports (Expo, AsyncStorage).
├── ui/               React Native screens and hooks.
└── index.js          DI wiring + feature registration.
```

### Dependency Rule
Each layer may only import from layers listed **above** it:

```
ui → application → domain
ui → ports        (via hooks resolving from DI)
infrastructure → ports
infrastructure → domain
application → ports
application → domain
```

`IncidentService`, `SyncManager`, and `incidentValidator` **never** import
from `expo-*`, `AsyncStorage`, or React — only from ports and domain.

---

## Key Classes / Modules

| File | Responsibility |
|------|----------------|
| `domain/incidentType.js` | Frozen `IncidentType` enum; `getEnabledTypesForPark` |
| `domain/syncStatus.js` | Frozen `SyncStatus` enum |
| `domain/incident.js` | `createIncident`, `markSynced`, `recordFailedAttempt`, `resetForRetry` |
| `domain/draft.js` | `createDraft`, `updateDraftStep`, `getRestoreStep`, `isDraftComplete` |
| `application/incidentValidator.js` | Field validation; throws `ValidationError` |
| `application/incidentService.js` | `logIncident`, `saveDraft`, `findDraft`, `discardDraft` |
| `application/syncManager.js` | Connectivity observer → outbox sync loop |
| `application/retryPolicy.js` | Exponential backoff helpers |
| `infrastructure/asyncStorageIncidentRepository.js` | Persists incidents via `KeyValueStore` |
| `infrastructure/asyncStorageDraftRepository.js` | Persists single draft |
| `infrastructure/gpsLocationProvider.js` | `expo-location`; respects `simulatorStore.gpsAvailable` |
| `infrastructure/expoCameraProvider.js` | `expo-image-picker`; respects `simulatorStore.cameraAvailable` |
| `infrastructure/mockRemoteGateway.js` | In-memory server mock; respects `simulatorStore.serverUp` |
| `infrastructure/expoPhotoStore.js` | Copies photo to `documentDirectory` |
| `ui/screens/IncidentTypeScreen.js` | Step 1: type selection card grid |
| `ui/screens/AddPhotoScreen.js` | Step 2: camera capture / skip |
| `ui/screens/LocationCaptureScreen.js` | Step 3: GPS auto-capture with A1 fallback |
| `ui/screens/ManualLocationScreen.js` | A1: manual coordinate entry |
| `ui/screens/DetailsScreen.js` | Step 4: description + save |
| `ui/screens/SavedScreen.js` | Terminal: synced vs pending message |
| `ui/screens/SyncStatusScreen.js` | E2: list with Retry / Sync All |
| `ui/RestoreDraftDialog.js` | E1: crash-recovery prompt on launch |

---

## Design Patterns

| Pattern | Where used |
|---------|-----------|
| **Repository** | `IncidentRepository`, `DraftRepository` ports and their implementations |
| **Strategy** | `GpsLocationProvider` vs `ManualLocationProvider` (both implement `LocationProvider`) |
| **Observer** | `connectivityMonitor.subscribe` → `SyncManager.handleConnectivityChange` |
| **Outbox** | `PENDING_SYNC` incidents are the persistent outbox queue |
| **State transitions** | `markSynced`, `recordFailedAttempt`, `resetForRetry` — pure functions, illegal transitions throw `AppError` |
| **Dependency Injection** | `index.js` builds and registers all instances; UI hooks resolve via `DIContainer` |

---

## DI Container Flow

```
App.js
  └─ buildContainer()
       ├─ AsyncStorageKeyValueStore  (core KV store)
       ├─ NetInfoConnectivityMonitor
       └─ registerLogIncidentFeature(container, kv, monitor)
            ├─ AsyncStorageIncidentRepository → singleton 'log-incident.incidentRepo'
            ├─ AsyncStorageDraftRepository    → singleton 'log-incident.draftRepo'
            ├─ MockRemoteGateway              → singleton 'log-incident.gateway'
            ├─ GpsLocationProvider            → singleton 'log-incident.gpsProvider'
            ├─ ExpoCameraProvider             → singleton 'log-incident.cameraProvider'
            └─ createSyncManager(...).start() → subscribed to connectivity
```

UI hooks (`useDraftRepo`, `useIncidentServices`) resolve from the container
or fall back to in-memory doubles when the container is not initialised
(e.g., in isolated Jest tests).
