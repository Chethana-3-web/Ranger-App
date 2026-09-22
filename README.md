# Ranger App

**Smart Wildlife Conservation and Anti-Poaching Monitoring System**
Sri Lanka Department of Wildlife Conservation
SE3070 – Case Studies in Software Engineering · 2026 Semester 2

---

## Overview

Mobile application for park rangers to log patrol incidents, track sync status,
and receive collar/camera-trap alerts — fully operational offline.

Built with React Native + Expo SDK 57, following the same architecture pattern
as the BinGo mobile app (`bingo/mobile/`).

---

## Setup

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## Testing

```bash
# Run all tests (pass with no tests on clean checkout)
npm test

# Watch mode
npx jest --watch

# Coverage report
npx jest --coverage
```

---

## Linting & Formatting

```bash
npm run lint      # ESLint check
npx prettier --write src/**/*.js   # Auto-format
```

---

## Folder Structure

```
src/
├── config/        parks.js, apiConfig.js
├── constants/     colors.js, strings.js
├── context/       SessionContext.js  (seeded ranger – no login)
├── navigation/    RootNavigator.js, MainNavigator.js
├── screens/       HomeScreen, LogIncidentScreen, IncidentListScreen,
│                  AlertsScreen (placeholder), ProfileScreen
├── services/      incidentService, locationService, storageService, syncService
└── components/    AppHeader, OfflineBanner, IncidentCard, SyncStatusChip
```

See `.kiro/steering/structure.md` for the full annotated layout.

---

## Architecture Notes

- **No login flow** – a seeded session (`Ranger Perera / PARK-YALA / PTL-001`) is
  injected via `SessionContext`. Real auth will be added in a later sprint.
- **Offline-first** – all writes go to AsyncStorage first; SyncManager uploads
  them when NetInfo reports connectivity is restored.
- **Mocked server** – `MockRemoteGateway` simulates the API. Replace `upload()`
  with a real `fetch`/`axios` call once the backend is ready.
- **Park-configurable incident types** – each park in `parks.js` declares its own
  `enabledIncidentTypes` array; only those types are shown to the ranger.

---

## Feature: Log Patrol Incident (UC-04)

Rangers record wildlife incidents (snares, carcasses, illegal camps, tracks)
with photo evidence, GPS location, and description. Works fully offline.

### Flow
```
Home → Select Type → Add Photo → GPS Capture → Details → Save → Saved
```

### Alternate Flows
- **A1 GPS unavailable** – manual coordinate entry at park centre
- **A2 Camera unavailable** – skip photo, continue with `photoUri = null`
- **A3 Cancel** – keep draft or discard

### Error Flows
- **E1 Crash recovery** – draft autosaved; restore prompt on next launch
- **E2 Sync failure** – exponential backoff, per-item Retry, Sync All screen
- **E3 Validation** – inline field errors, Save stays disabled
- **E4 Storage failure** – error dialog, draft retained

### Feature Structure
```
src/features/log-incident/
├── domain/          Incident, Draft, IncidentType, SyncStatus (pure)
├── ports/           Abstract contracts for all I/O
├── application/     incidentService, syncManager, validator, retryPolicy
├── infrastructure/  Expo/AsyncStorage implementations + test doubles
└── ui/              Screens, hooks
```

### Docs
- `docs/architecture.md` – layers, patterns, DI wiring
- `docs/traceability.md` – flow → screen → method → test
- `docs/demo-script.md` – how to trigger every flow via the Simulator Panel

---

## Git Branches

| Branch                        | Contents                        |
|-------------------------------|---------------------------------|
| `main`                        | Initial Expo scaffold           |
| `dev`                         | Common foundation               |
| `feature/log-patrol-incident` | Log Incident feature (checked out) |

---

## Teammate Feature Folders

Teammates add their features under `src/features/<feature-name>/`.
Do **not** create files in those folders until assigned.

| Feature              | Folder                         |
|----------------------|--------------------------------|
| Collar Alerts        | `src/features/collar-alerts/`  |
| Camera Trap Review   | `src/features/camera-trap/`    |
| Community Reports    | `src/features/community-reports/` |

---

## Push to GitHub

```bash
git remote add origin https://github.com/<YOUR_ORG>/ranger-app.git
git push -u origin main dev feature/log-patrol-incident
```
