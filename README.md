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
- **Offline-first** – all writes go to AsyncStorage first; `syncService` uploads
  them when NetInfo reports connectivity.
- **Mocked server** – `syncService.uploadToServer()` simulates an API call.
  Replace with a real `axios` call once the backend is ready.
- **Park-configurable incident types** – each park in `parks.js` declares its own
  `enabledIncidentTypes` array, so `LogIncidentScreen` shows only relevant types.

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
