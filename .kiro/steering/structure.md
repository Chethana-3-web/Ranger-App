# Ranger App – Folder Structure

Mirrors the BinGo mobile app layout (`bingo/mobile/src/`) with domain-appropriate naming.

```
ranger-app/
├── App.js                        ← root: providers + NavigationContainer
├── index.js                      ← Expo entry point
├── app.json                      ← Expo config
├── babel.config.js
├── package.json
├── .eslintrc.js
├── .prettierrc.js
│
├── assets/                       ← icons, splash, images
│
└── src/
    ├── config/
    │   ├── apiConfig.js          ← base URL, timeouts, sync intervals
    │   └── parks.js              ← park seed data (id, name, centre, enabledIncidentTypes)
    │
    ├── constants/
    │   ├── colors.js             ← green conservation palette (mirrors BinGo COLORS)
    │   └── strings.js            ← all UI copy, incident type labels, status labels
    │
    ├── context/
    │   └── SessionContext.js     ← seeded ranger + patrol; useSession() hook
    │
    ├── navigation/
    │   ├── RootNavigator.js      ← top-level stack (goes straight to MainNavigator)
    │   └── MainNavigator.js      ← bottom tabs: Home | Incidents | Alerts | Profile
    │
    ├── screens/
    │   ├── HomeScreen.js         ← patrol dashboard, quick-action tiles
    │   ├── LogIncidentScreen.js  ← log patrol incident form (STEP 3 feature)
    │   ├── IncidentListScreen.js ← list of patrol incidents + FAB
    │   ├── AlertsScreen.js       ← placeholder for collar alert feature
    │   └── ProfileScreen.js      ← seeded ranger info
    │
    ├── services/
    │   ├── incidentService.js    ← logIncident, getAllIncidents, markSynced, etc.
    │   ├── locationService.js    ← getCurrentLocation, buildManualLocation
    │   ├── storageService.js     ← AsyncStorage key-value wrappers
    │   └── syncService.js        ← upload pending incidents, NetInfo listener
    │
    └── components/
        ├── AppHeader.js          ← sticky dark-green header with optional back button
        ├── OfflineBanner.js      ← amber offline indicator (NetInfo driven)
        ├── IncidentCard.js       ← incident summary card for list view
        └── SyncStatusChip.js     ← Pending / Synced / Failed pill badge

── Teammate feature folders (do not create code here – each feature owner does) ──
    └── src/features/
        ├── collar-alerts/        ← GPS collar monitoring feature
        ├── camera-trap/          ← camera trap image review
        └── community-reports/    ← community conflict reporting
```

## Naming Conventions
- Files: `PascalCase.js` for components/screens/navigators; `camelCase.js` for services/config
- Components: functional, JSDoc'd props
- Services: async functions, return plain objects (no Expo types)
- Tests: co-located in `__tests__/` or `*.test.js` alongside the tested file
