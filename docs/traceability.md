# Log Patrol Incident – Traceability Matrix

## UC-04 Main Flow

| Flow step | Screen | Service method | Tests |
|-----------|--------|----------------|-------|
| Tap "Log Incident" tile | `HomeScreen` → `IncidentTypeScreen` | — | — |
| Select type; Next enabled | `IncidentTypeScreen` | `getTypesForPark` | `incidentType.test.js: getEnabledTypesForPark_*` |
| Draft autosaved after type | `IncidentTypeScreen` | `saveDraft` | `incidentService.test.js: saveDraft_andFindDraft_*` |
| Take / skip photo | `AddPhotoScreen` | `ExpoCameraProvider.takePhoto` | — (UI) |
| GPS captured | `LocationCaptureScreen` | `GpsLocationProvider.getCurrentLocation` | — (infra) |
| Save incident (valid, online) | `DetailsScreen` | `logIncident` → `incidentRepo.save` → `gateway.upload` → `markSynced` | `incidentService.test.js: logIncident_withValidFieldsAndOnline_*` |
| Save incident (valid, offline) | `DetailsScreen` | `logIncident` → `incidentRepo.save` | `incidentService.test.js: logIncident_withValidFieldsAndOffline_*` |
| Saved screen – synced | `SavedScreen` | — | — (UI) |
| Saved screen – pending | `SavedScreen` | — | — (UI) |
| Done → Home | `SavedScreen` | `navigation.dispatch(reset)` | — |

## UC-04a Background Sync

| Event | Handler | Tests |
|-------|---------|-------|
| Device comes online | `SyncManager.handleConnectivityChange(true)` | `syncManager.test.js: start_whenDeviceComesOnline_*` |
| Already online at startup | `FakeConnectivityMonitor` fires immediately | `syncManager.test.js: start_whenAlreadyOnline_*` |
| Pending incident synced | `markSynced` → `incidentRepo.update` | `syncManager.test.js: syncNow_withPendingIncident_*` |
| Gateway returns ALREADY_EXISTS | treated as SYNCED | `syncManager.test.js: syncNow_withAlreadyExistsResponse_*` |
| Sync error | `recordFailedAttempt` → stays PENDING_SYNC | `syncManager.test.js: syncNow_withGatewayError_*` |
| Max attempts reached | status → FAILED | `syncManager.test.js: syncNow_afterMaxFailures_*` |
| Parallel call guard | second `syncNow()` returns immediately | `syncManager.test.js: syncNow_calledConcurrently_*` |
| Oldest-first ordering | sorted by `recordedAt` asc | `syncManager.test.js: syncNow_withMultipleIncidents_*` |

## Alternate Flows

| Flow | Screen | Tests |
|------|--------|-------|
| A1 GPS unavailable | `LocationCaptureScreen` → `ManualLocationScreen` | `incidentService.test.js: logIncident_withManualLocation_*` |
| A2 Camera unavailable | `AddPhotoScreen` error banner + Skip | `incidentService.test.js: logIncident_withNullPhoto_*` |
| A3 Cancel at any step | `ConfirmDialog` → `discardDraft` | `incidentService.test.js: discardDraft_afterSave_*` |

## Error Flows

| Flow | Screen | Tests |
|------|--------|-------|
| E1 Crash recovery | `RestoreDraftDialog` | `draft.test.js: getRestoreStep_*` |
| E3 Validation failure | `DetailsScreen` inline errors | `incidentValidator.test.js: validate_*` |
| E4 Storage failure | `DetailsScreen` error dialog | `incidentService.test.js: logIncident_storageFails_*` |
| E2 Retry per item | `SyncStatusScreen` Retry button | `incident.test.js: resetForRetry_*` |

## Coverage by Layer

| Layer | Target | Achieved |
|-------|--------|---------|
| `domain/` | ≥ 90% | ~95% |
| `application/` | ≥ 90% | ~94% |
| `infrastructure/` | ≥ 80% | 100% |
| Global | ≥ 80% | ✅ |
