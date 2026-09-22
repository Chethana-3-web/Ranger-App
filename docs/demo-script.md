# Demo Script – Log Patrol Incident

All flows can be triggered entirely through the **Simulator Panel** (long-press
the header on the Home screen in dev mode) without a real device.

---

## Setup
1. `npm start` → open in Expo Go or Android emulator.
2. Long-press the "Ranger App" header to open the Simulator Panel.

---

## Main Flow (Happy Path)

| Step | Action |
|------|--------|
| 1 | Simulator Panel: confirm `gpsAvailable ✓`, `cameraAvailable ✓`, `serverUp ✓`, `networkOverride auto`. |
| 2 | Home → tap **Log Incident**. |
| 3 | Select **Snare / Trap** card → tap **Next**. |
| 4 | Tap **Take Photo** → camera opens → take or retake → tap **Use This Photo**. |
| 5 | GPS capturing screen → location auto-captured → advances to Details. |
| 6 | Enter description (e.g. "Wire snare found near waterhole W3") → tap **Save Incident**. |
| 7 | **Saved screen** shows "Incident saved successfully." (SYNCED). |
| 8 | Tap **Done** → returns to Home. Incident count increments. |

---

## A1 – GPS Unavailable

| Step | Action |
|------|--------|
| 1 | Simulator Panel: set `gpsAvailable = false`. |
| 2 | Log Incident → select type → skip photo. |
| 3 | Location screen shows "GPS Unavailable" dialog. |
| 4 | Tap **Mark Manually** → enter lat/lng (e.g. 6.3728, 81.5198) → **Confirm**. |
| 5 | Details screen shows `MANUAL` source badge. Save → Saved screen shows "Will sync when connected." |
| 6 | Reset: `gpsAvailable = true`. |

---

## A2 – Camera Unavailable

| Step | Action |
|------|--------|
| 1 | Simulator Panel: set `cameraAvailable = false`. |
| 2 | Log Incident → select type → on Add Photo screen, tap **Take Photo**. |
| 3 | Error banner: "Camera unavailable or permission denied." |
| 4 | Tap **Skip Photo →** → continues to Location Capture. |
| 5 | Reset: `cameraAvailable = true`. |

---

## A3 – Cancel and Discard

| Step | Action |
|------|--------|
| 1 | Log Incident → select a type. |
| 2 | Tap the **back arrow** (header). |
| 3 | Dialog: "Cancel Incident?" → tap **Discard**. |
| 4 | Returns to Home. Draft deleted. |

---

## E1 – Crash Recovery

| Step | Action |
|------|--------|
| 1 | Log Incident → select type → navigate away (kill the app or force close). |
| 2 | Relaunch the app. |
| 3 | "You have an unsaved incident. Restore it?" → tap **Restore**. |
| 4 | App resumes at the Add Photo step (step after the last completed one). |

---

## E2 – Sync Failure and Retry

| Step | Action |
|------|--------|
| 1 | Simulator Panel: set `serverUp = false`. |
| 2 | Log an incident while **online** (networkOverride = auto). |
| 3 | Saved screen shows "Incident saved locally." (immediate sync failed). |
| 4 | Incidents tab → **Sync Status** → incident shows **Pending Sync**. |
| 5 | Simulator Panel: set `serverUp = true`. |
| 6 | Tap **Retry** on the incident row OR pull-to-refresh. |
| 7 | Incident chip changes to **Synced**. |

---

## E2 – Offline → Auto Sync on Reconnect

| Step | Action |
|------|--------|
| 1 | Simulator Panel: `networkOverride = offline`. |
| 2 | Log an incident → Saved screen: "Will sync when connected." |
| 3 | Simulator Panel: `networkOverride = auto`. |
| 4 | SyncManager detects connectivity → background sync runs automatically. |
| 5 | Sync Status screen → chip turns **Synced** within seconds. |

---

## E3 – Validation Failure

| Step | Action |
|------|--------|
| 1 | Log Incident → select type → skip photo → enter location. |
| 2 | On Details screen: clear the description field. |
| 3 | "Description is required." error appears inline. Save button stays disabled. |
| 4 | Enter 501 characters → "too long" error shown. |

---

## Assumptions

1. `expo-file-system` is available in the managed Expo workflow; installed via `npm install expo-file-system`.
2. The parks seed data uses incident type keys `SNARE`, `CARCASS`, `TRACKS`, `CAMPSITE`, `OTHER`. The old screens used `CAMP` and `FOOTPRINT` — these have been normalised to match the domain enum.
3. `ManualLocationScreen` shows a coordinate-entry form instead of a real MapView (MapView requires native map SDK setup outside the managed workflow scope).
4. `MockRemoteGateway` simulates 200 ms network latency; replace `upload()` with a real `fetch`/`axios` call when the backend is ready.
5. The `RestoreDraftDialog` is mounted from within the navigation container so it can call `navigation.navigate`. In production, it should be placed near the root of the navigation tree (e.g. inside `HomeScreen` on focus).
6. Background sync uses `connectivityMonitor.subscribe` — on real devices this is `NetInfoConnectivityMonitor`; in tests it is `FakeConnectivityMonitor`.
