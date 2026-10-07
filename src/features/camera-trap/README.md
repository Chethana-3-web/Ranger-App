# Review Camera Trap Images – Feature Specification

**Feature Owner:** Camera Trap Review  
**Technology:** React Native + Expo SDK 57, JavaScript  
**Architecture:** Offline-first, layered domain-driven design  
**Project:** Ranger App – Smart Wildlife Conservation System

---

## Feature Overview

**Review Camera Trap Images** enables Park Managers to review images uploaded from camera traps deployed throughout the park. Reviewers can identify wildlife species, record animal counts, and flag suspicious human activity for enforcement review.

This feature operates offline-first and follows the same architectural patterns established by `src/features/log-incident/`.

---

## Primary Actors

- **Park Manager** (the only reviewer role)

**Park Manager** is the only role that can access Camera Trap Review. The current seeded session does not implement authentication; future User Management will control access.

---

## User Management – Current Sprint

### What is NOT Implemented

This feature does **NOT** implement:

- Login flow
- Registration
- JWT authentication
- Role management
- Authorization logic inside Camera Trap screens

### Current Development Approach

The application currently uses a **seeded SessionContext** (`src/core/session/SessionContext.js`) with a fixed Ranger user:

```javascript
SEEDED_RANGER = {
  id:     'RNG-001',
  name:   'Ranger Perera',
  parkId: 'PARK-YALA',
  role:   'ranger',
}
```

**⚠️ WARNING:** Do NOT replace this seeded Ranger globally with a Park Manager, as the Log Patrol Incident feature (teammate feature) requires the Ranger session.

For Camera Trap development:
- Assume the current user has permission to access Camera Trap Review
- The feature must be accessible without login during development/testing
- Future authorization will be added at the navigation or centralized layer

---

## Future User Management Integration

After User Management is implemented, the expected flow will be:

```
Login
  ↓
Authentication
  ↓
currentUser
  ↓
Role / Permission Check
  ↓
if (user.role === "park_manager")
  ↓
Camera Trap Review Screens
```

**Key Principle:** Camera Trap screens should remain logic-agnostic about authentication. Access control should be enforced from:
- `MainNavigator.js` (navigation-level visibility)
- A centralized authorization service
- Route guards

The screens created now will continue working after User Management is added.

---

## Main Use Case

### UC-05: Review Camera Trap Images

**Description:**  
A Park Manager reviews images uploaded from camera traps to identify wildlife and record species information. If an image contains suspicious human activity, the reviewer can flag the image for future enforcement review.

---

## Main Flow

1. Reviewer opens **Camera Trap Review**.
2. System displays **camera traps containing images waiting for review**.
3. Reviewer **selects a camera trap**.
4. System displays **images belonging to that camera trap**.
5. Reviewer **selects an image**.
6. System displays:
   - Image
   - Camera ID
   - Timestamp
   - Location (GPS coordinates)
7. Reviewer **identifies wildlife**.
8. Reviewer **selects species** from a dropdown/picker.
9. Reviewer **enters animal count**.
10. Reviewer **saves classification**.
11. System **stores the classification locally** (AsyncStorage).
12. Reviewer can **continue to the next image**.
13. If reviewer notices **possible suspicious human activity**, they open **Suspicious Activity Review**.
14. Reviewer can select:
    - **Suspicious**
    - **Not Suspicious**
    - **Unclear**
15. If **Suspicious** is selected, reviewer enters a **reason** and optional **notes**.
16. System **stores the suspicious flag locally**.
17. Image becomes **available for future enforcement review** (external workflow).

---

## Alternate Flows

### A1 – Unclear Image

If an animal or person cannot be identified clearly:
- Reviewer selects **Mark as Unclear**
- System preserves the image with `reviewStatus: 'unclear'`
- Image remains available for later review or expert consultation

### A2 – Human Not Suspicious

If the human is an authorized worker, tourist, or otherwise not suspicious:
- Reviewer selects **Not Suspicious**
- System saves the review result with `suspiciousActivity: { isSuspicious: false }`
- No enforcement investigation is created

### A3 – Multiple Animals

Allow the reviewer to record several animals of the same species:

**Example:**
```
Species: Sri Lankan Elephant
Count: 4
```

The count field must accept values ≥ 1.

---

## Error Flows

### E1 – Image Fails to Load

- Show error message: "Unable to load image. Please check your connection."
- Provide **Retry** button
- Preserve image metadata
- Keep image in `pending` review status
- Do not block access to other images

### E2 – Classification Save Fails

- Show error message: "Failed to save classification. Please try again."
- Preserve entered species and count values
- Provide **Retry** button
- Keep image in `pending` status
- Allow user to navigate back without losing data

### E3 – Suspicious Flag Save Fails

- Show error message: "Failed to flag suspicious activity. Please try again."
- Preserve reason and notes
- Provide **Retry** button
- Keep image in `pending` status
- Allow user to navigate back without losing data

---

## Required Screens

### 1. CameraTrapListScreen

**Purpose:** Display all camera traps that have images waiting for review.

**Display:**
- Camera ID (e.g., `CT-001`, `CT-002`)
- Location name or GPS coordinates
- Pending image count (e.g., "12 pending")
- Thumbnail (if available) or placeholder icon
- Status indicator (e.g., "Active", "Inactive")

**Actions:**
- Tap a camera trap → navigate to `CameraTrapImagesScreen`

**Reusable Components:**
- `AppHeader` (title: "Camera Traps")
- `OfflineBanner` (if offline)
- `Card` (for each camera trap)
- `ScreenContainer`

---

### 2. CameraTrapImagesScreen

**Purpose:** Display all images from the selected camera trap.

**Display:**
- Camera trap name/ID in header
- Grid or list of image thumbnails
- Timestamp for each image
- Review status badge:
  - `pending` → amber/yellow chip
  - `classified` → green chip
  - `unclear` → gray chip
  - `flagged` → red chip

**Actions:**
- Tap an image → navigate to `ImageReviewScreen`

**Reusable Components:**
- `AppHeader` (title: Camera ID, back button)
- `OfflineBanner`
- `StatusChip` (for review status)
- `ScreenContainer`

---

### 3. ImageReviewScreen

**Purpose:** Main image review interface.

**Display:**
- Full-screen camera trap image (zoomable)
- Camera ID
- Timestamp
- Location (GPS coordinates)
- Current review status badge

**Actions:**
- **Classify Wildlife** button → navigate to `ClassifyWildlifeScreen`
- **Review Suspicious Activity** button → navigate to `SuspiciousActivityScreen`
- **Mark as Unclear** button → update status locally, navigate back
- **Next Image** button (if available)

**Reusable Components:**
- `AppHeader` (with back button)
- `PrimaryButton` (Classify Wildlife)
- `SecondaryButton` (Review Suspicious, Mark Unclear)
- `StatusChip` (review status)
- `ScreenContainer`

---

### 4. ClassifyWildlifeScreen

**Purpose:** Record species and animal count.

**Fields:**
- **Species** (dropdown/picker):
  - Sri Lankan Elephant
  - Sri Lankan Leopard
  - Spotted Deer
  - Wild Boar
  - Other (text input)
- **Animal Count** (number input, min: 1)

**Validation:**
- Species is required
- Count is required
- Count must be ≥ 1

**Actions:**
- **Save** → validate, save classification locally, navigate to `ReviewStatusScreen` or back to image list
- **Cancel** → discard changes, navigate back

**Reusable Components:**
- `AppHeader` (title: "Classify Wildlife", back button)
- `TextField` (for count input)
- `PrimaryButton` (Save)
- `SecondaryButton` (Cancel)
- `ScreenContainer`

---

### 5. SuspiciousActivityScreen

**Purpose:** Review human activity detected in image.

**Options:**
- **Suspicious** (radio button or card selection)
- **Not Suspicious** (radio button or card selection)
- **Unclear** (radio button or card selection)

**Conditional Fields (if Suspicious selected):**
- **Reason** (dropdown/picker):
  - Poaching Activity
  - Illegal Logging
  - Unauthorized Entry
  - Suspicious Behavior
  - Other (text input)
- **Notes** (multi-line text input, optional)

**Actions:**
- **Flag Image** (enabled only if decision is made) → save locally, navigate to `ReviewStatusScreen`
- **Cancel** → discard changes, navigate back

**Reusable Components:**
- `AppHeader` (title: "Suspicious Activity", back button)
- `TextField` (for notes)
- `PrimaryButton` (Flag Image)
- `SecondaryButton` (Cancel)
- `ScreenContainer`

---

### 6. ReviewStatusScreen

**Purpose:** Display saved review result and current status.

**Display:**
- Success message (e.g., "Classification saved successfully")
- Review status:
  - **Classified** → "Species: Sri Lankan Elephant, Count: 2"
  - **Unclear** → "Image marked as unclear for later review"
  - **Flagged** → "Image flagged for enforcement review"
  - **Pending Enforcement Review** → "Awaiting enforcement officer"
  - **Under Investigation** → "Case #INV-123 in progress"

**⚠️ Important:**  
This screen **displays** investigation status but does NOT implement the complete Enforcement Officer workflow. The full enforcement case management system is OUT OF SCOPE for Camera Trap Review.

**Actions:**
- **Next Image** button → navigate to next pending image
- **Back to Camera Trap** button → navigate to `CameraTrapImagesScreen`
- **Done** button → navigate to `CameraTrapListScreen`

**Reusable Components:**
- `AppHeader`
- `PrimaryButton`
- `SecondaryButton`
- `StatusChip`
- `ScreenContainer`

---

## Navigation Flow

```
CameraTrapListScreen
        ↓
  (select camera trap)
        ↓
CameraTrapImagesScreen
        ↓
  (select image)
        ↓
ImageReviewScreen
        ↓
 ┌──────────────────┬─────────────────────┬──────────────┐
 ↓                  ↓                     ↓              ↓
Classify         Suspicious          Mark Unclear    Next Image
Wildlife         Activity
 ↓                  ↓
ClassifyWildlife  SuspiciousActivity
Screen            Screen
 ↓                  ↓
Save              Suspicious?
 ↓                  ↓
ReviewStatus      (if yes) Reason + Notes
Screen                ↓
                  Flag Image
                      ↓
                  ReviewStatusScreen
```

**Navigation Implementation:**  
Use **React Navigation** (existing project convention). Do NOT use Expo Router.

Integration point: `src/navigation/MainNavigator.js` → Add Camera Trap stack to the **Alerts** tab or create a new tab.

---

## Domain Data Models

### CameraTrap

```javascript
{
  id: string,              // e.g., "CT-001"
  name: string,            // e.g., "Camera Trap 1 - North Trail"
  location: {
    lat: number,
    lng: number,
    name: string           // e.g., "North Trail Intersection"
  },
  pendingImageCount: number,
  status: string,          // "active" | "inactive" | "maintenance"
  lastImageAt: string,     // ISO 8601 timestamp
  createdAt: string
}
```

### CameraTrapImage

```javascript
{
  id: string,              // e.g., "IMG-001"
  cameraTrapId: string,    // e.g., "CT-001"
  imageUri: string,        // local or remote URI
  timestamp: string,       // ISO 8601
  location: {
    lat: number,
    lng: number
  },
  reviewStatus: string,    // "pending" | "classified" | "unclear" | "flagged"
  classification: WildlifeClassification | null,
  suspiciousActivity: SuspiciousActivity | null,
  syncStatus: string,      // "pending" | "syncing" | "synced" | "failed"
  createdAt: string,
  reviewedAt: string | null
}
```

### WildlifeClassification

```javascript
{
  species: string,         // "Sri Lankan Elephant", "Spotted Deer", etc.
  count: number,           // ≥ 1
  reviewedBy: string,      // user ID or name
  reviewedAt: string       // ISO 8601
}
```

### SuspiciousActivity

```javascript
{
  id: string,              // e.g., "SA-001"
  imageId: string,         // reference to CameraTrapImage
  isSuspicious: boolean,   // true | false
  decision: string,        // "suspicious" | "not_suspicious" | "unclear"
  reason: string | null,   // "Poaching Activity", "Illegal Logging", etc.
  notes: string | null,    // optional free text
  reviewedBy: string,      // user ID or name
  createdAt: string,
  status: string           // "pending" | "under_investigation" | "resolved"
}
```

---

## Review Status Values

| Status | Description |
|--------|-------------|
| `pending` | Image awaiting initial review |
| `classified` | Wildlife identified and saved |
| `unclear` | Image quality insufficient for identification |
| `flagged` | Suspicious human activity detected |

---

## Synchronization Status Values

| Sync Status | Description |
|-------------|-------------|
| `pending` | Local changes not yet uploaded |
| `syncing` | Upload in progress |
| `synced` | Successfully synchronized with server |
| `failed` | Upload failed, retry required |

---

## Camera Trap Data – Dynamic Loading

**⚠️ DO NOT HARDCODE:**
```javascript
// ❌ BAD
const CAMERA_TRAPS = [
  { id: "CT-007", name: "Camera Trap #07" }
];
```

**✅ CORRECT:**
```javascript
// Camera traps loaded from mock data or repository
const cameraTraps = await cameraTrapService.getAllCameraTraps();
```

Selecting a camera trap dynamically determines which images are displayed:
```javascript
const images = await cameraTrapService.getImagesByCameraTrapId(cameraTrapId);
```

---

## Mock Backend

The backend is not ready. Development should use **mock data** and a **mock gateway**.

### MockCameraTrapGateway

Create `infrastructure/mockCameraTrapGateway.js` with methods:

```javascript
{
  getCameraTraps: () => Promise<CameraTrap[]>,
  getCameraTrapImages: (cameraTrapId: string) => Promise<CameraTrapImage[]>,
  saveClassification: (imageId, classification) => Promise<void>,
  markUnclear: (imageId) => Promise<void>,
  saveSuspiciousFlag: (imageId, suspiciousActivity) => Promise<void>
}
```

**Future:** Replace with real API calls (`fetch` or `axios`) once backend is ready.

---

## Mock Data Requirements

Development mock data should include:

### Minimum Data Set

- **3 camera traps** with varying pending counts
- **15+ images** across all camera traps

### Image Scenarios

Include examples for:
- **Single elephant** (easy classification)
- **Multiple elephants** (count: 3-5)
- **Spotted deer** or other wildlife species
- **Unclear image** (blurry, dark, obstructed)
- **Human activity – authorized** (park ranger, tourist with guide)
- **Human activity – suspicious** (nighttime activity, carrying equipment)
- **Already reviewed image** (status: `classified` or `flagged`)

### Example Mock Camera Trap

```javascript
{
  id: "CT-001",
  name: "North Trail Camera",
  location: {
    lat: 6.4281,
    lng: 81.3295,
    name: "North Trail Intersection"
  },
  pendingImageCount: 8,
  status: "active",
  lastImageAt: "2026-09-26T14:30:00.000Z",
  createdAt: "2026-08-01T00:00:00.000Z"
}
```

---

## Offline-First Architecture

Camera Trap Review must follow the existing **offline-first architecture** established by `src/features/log-incident/`.

### Layered Architecture

```
src/features/camera-trap/
│
├── domain/           Pure data models, enums, business rules (no I/O, no React)
├── ports/            Abstract contracts (JSDoc interfaces)
├── application/      Use-case services (depends only on ports + domain)
├── infrastructure/   Real implementations (AsyncStorage, Expo, mock gateway)
└── ui/               React Native screens, components, hooks
```

### Dependency Rule

```
ui → application → domain
ui → ports (via hooks resolving from DI container)
infrastructure → ports
infrastructure → domain
application → ports
application → domain
```

**Key Principle:** Application services (e.g., `cameraTrapService.js`) should **never** import from:
- `expo-*`
- `@react-native-async-storage/async-storage`
- React Native components

Only infrastructure implementations import platform-specific code.

---

## Proposed Feature Structure

```
src/features/camera-trap/
│
├── domain/
│   ├── cameraTrap.js             // CameraTrap factory, validation
│   ├── cameraTrapImage.js        // CameraTrapImage factory, state transitions
│   ├── wildlifeClassification.js // Classification factory
│   ├── suspiciousActivity.js     // SuspiciousActivity factory
│   ├── reviewStatus.js           // REVIEW_STATUS enum (frozen)
│   ├── syncStatus.js             // SYNC_STATUS enum (frozen) or reuse core
│   └── __tests__/
│
├── ports/
│   ├── CameraTrapRepository.js   // JSDoc contract
│   ├── ImageRepository.js        // JSDoc contract
│   └── CameraTrapGateway.js      // JSDoc contract (future remote API)
│
├── application/
│   ├── cameraTrapService.js      // getAllCameraTraps, getCameraTrapById
│   ├── imageReviewService.js     // getImages, saveClassification, markUnclear
│   ├── suspiciousActivityService.js // saveSuspiciousFlag
│   ├── syncManager.js            // upload reviews when connectivity restored
│   ├── validator.js              // validate species, count, reason
│   └── __tests__/
│
├── infrastructure/
│   ├── asyncStorageCameraTrapRepository.js
│   ├── asyncStorageImageRepository.js
│   ├── mockCameraTrapGateway.js
│   ├── mockCameraTrapData.js     // seed data
│   └── __tests__/
│
├── ui/
│   ├── screens/
│   │   ├── CameraTrapListScreen.js
│   │   ├── CameraTrapImagesScreen.js
│   │   ├── ImageReviewScreen.js
│   │   ├── ClassifyWildlifeScreen.js
│   │   ├── SuspiciousActivityScreen.js
│   │   └── ReviewStatusScreen.js
│   ├── components/
│   │   ├── CameraTrapCard.js
│   │   ├── ImageThumbnail.js
│   │   ├── SpeciesPicker.js
│   │   └── SuspiciousActivityForm.js
│   └── hooks/
│       ├── useCameraTrapService.js
│       ├── useImageReviewService.js
│       └── useSuspiciousActivityService.js
│
├── index.js              // Feature registration + DI wiring
└── README.md             // This file
```

**Note:** Do NOT create these folders/files during this specification phase. This structure will be implemented in future tasks.

---

## Reusable Common Components

Camera Trap Review can reuse the following components from `src/core/ui/`:

| Component | Usage |
|-----------|-------|
| `AppHeader` | Screen titles, back navigation |
| `OfflineBanner` | Offline indicator (follows existing pattern) |
| `SyncStatusChip` | Display sync status (pending, synced, failed) |
| `StatusChip` | Display review status (pending, classified, unclear, flagged) |
| `PrimaryButton` | Main actions (Save, Flag Image) |
| `SecondaryButton` | Secondary actions (Cancel, Back) |
| `TextField` | Text inputs (count, notes) |
| `ScreenContainer` | Consistent screen layout wrapper |
| `Card` | Camera trap list items |
| `ConfirmDialog` | Confirmation prompts (if needed) |

### Shared Constants

Reuse from `src/core/constants/`:

| File | Usage |
|------|-------|
| `colors.js` | All color values (PRIMARY, SUCCESS, ERROR, etc.) |

**Create new constants only if Camera Trap-specific:**
- Wildlife species list
- Suspicious activity reasons
- Review status labels

---

## Shared Code Safety

This is a **team project**. Camera Trap work must primarily remain under:

```
src/features/camera-trap/
```

### Do NOT Modify (Teammate Features)

- `src/features/log-incident/`
- `src/features/collar-alerts/`
- `src/features/community-reports/`

### Modify with Caution (Shared Files)

The following files are shared across features. Changes require team coordination:

| File | When to Modify |
|------|----------------|
| `src/navigation/MainNavigator.js` | Adding Camera Trap navigation stack |
| `src/navigation/RootNavigator.js` | Only if top-level routing changes |
| `src/core/session/SessionContext.js` | **DO NOT** replace seeded Ranger |
| `src/core/constants/colors.js` | Only if new Camera Trap-specific colors needed |
| `src/screens/HomeScreen.js` | Adding Camera Trap quick-action tile |
| `src/screens/AlertsScreen.js` | Possible Camera Trap entry point |

### Modification Protocol

Before modifying a shared file, the developer/Kiro must explain:

1. **Which file** will be changed
2. **Why** the change is necessary
3. **What exactly** will change (show the specific addition/modification)
4. **Whether another feature** may be affected
5. **Alternative approaches** considered

---

## Session Context Warning

The current project contains a **seeded Ranger user** (`Ranger Perera`):

```javascript
SEEDED_RANGER = {
  id:     'RNG-001',
  name:   'Ranger Perera',
  parkId: 'PARK-YALA',
  role:   'ranger',
}
```

**⚠️ DO NOT** globally replace this Ranger with a Park Manager because:
- The seeded Ranger is required by the **Log Patrol Incident** feature (teammate feature)
- Other teammates may depend on this session structure

### Camera Trap Approach

Camera Trap Review should:
- **Access the current session** via `useSession()` hook
- **Treat the user as authorized** for development
- **Record reviewedBy** using the current user's name/ID
- **Remain ready** to receive the real authenticated user after User Management is implemented

**Future:** When User Management is added, `SessionContext` will provide the real authenticated user with proper roles.

---

## Out of Scope

The following items are **OUT OF SCOPE** for the Camera Trap Review feature:

### Authentication & User Management
- Login screen
- Registration screen
- Forgot Password screen
- JWT authentication implementation
- Complete role management system
- Authorization middleware

### Other Features
- Log Patrol Incident implementation (teammate feature)
- Collar Alert implementation (teammate feature)
- Community Report implementation (teammate feature)

### Enforcement Workflow
- Complete Enforcement Officer case management system
- Investigation workflow screens
- Evidence collection beyond flagging
- Case assignment logic
- Investigation status updates (beyond display)

### Backend
- Production API implementation
- Real server endpoints
- Database schema
- Authentication server

**Note:** Camera Trap Review will **display** investigation status but delegates the full enforcement workflow to a future feature or external system.

---

## Testing Strategy

Future tests should cover:

### Domain Logic Tests
- `cameraTrap.js` factory and validation
- `cameraTrapImage.js` state transitions
- `wildlifeClassification.js` validation
- `suspiciousActivity.js` factory

### Validation Tests
- Species is required
- Animal count is required
- Animal count must be ≥ 1
- Reason required when Suspicious selected
- Notes are optional

### Application Service Tests
- `cameraTrapService.getAllCameraTraps()`
- `imageReviewService.saveClassification(imageId, classification)`
- `imageReviewService.markUnclear(imageId)`
- `suspiciousActivityService.saveSuspiciousFlag(imageId, activity)`

### Error Handling Tests
- Failed classification save (E2)
- Failed suspicious flag save (E3)
- Image load failure (E1)
- Validation errors

### Offline Behavior Tests
- Classifications saved locally when offline
- Suspicious flags stored locally when offline
- Sync status updated correctly
- Data preserved during offline → online transition

### Repository Tests
- AsyncStorage CRUD operations
- Data persistence and retrieval
- Update review status
- Query by camera trap ID

### Integration Tests
- Complete review workflow (pending → classified)
- Suspicious activity workflow (pending → flagged)
- Navigation flow through all screens

---

## Implementation Tasks

These tasks will be executed in future implementation phases. **DO NOT execute them during this specification phase.**

### Task Checklist

- [ ] **Task 1** – Create feature folder structure (`domain/`, `ports/`, `application/`, `infrastructure/`, `ui/`)
- [ ] **Task 2** – Create domain models (`cameraTrap.js`, `cameraTrapImage.js`, `wildlifeClassification.js`, `suspiciousActivity.js`, `reviewStatus.js`)
- [ ] **Task 3** – Create mock camera trap data (`infrastructure/mockCameraTrapData.js` with 3 camera traps, 15+ images)
- [ ] **Task 4** – Create port contracts (`CameraTrapRepository.js`, `ImageRepository.js`, `CameraTrapGateway.js`)
- [ ] **Task 5** – Create infrastructure implementations (`asyncStorageCameraTrapRepository.js`, `asyncStorageImageRepository.js`, `mockCameraTrapGateway.js`)
- [ ] **Task 6** – Create application services (`cameraTrapService.js`, `imageReviewService.js`, `suspiciousActivityService.js`, `validator.js`)
- [ ] **Task 7** – Create reusable UI components (`CameraTrapCard.js`, `ImageThumbnail.js`, `SpeciesPicker.js`, `SuspiciousActivityForm.js`)
- [ ] **Task 8** – Create `CameraTrapListScreen` (display all camera traps with pending counts)
- [ ] **Task 9** – Create `CameraTrapImagesScreen` (display images for selected camera trap)
- [ ] **Task 10** – Create `ImageReviewScreen` (main review interface with action buttons)
- [ ] **Task 11** – Create `ClassifyWildlifeScreen` (species picker + count input + validation)
- [ ] **Task 12** – Create `SuspiciousActivityScreen` (decision selection + conditional reason/notes)
- [ ] **Task 13** – Create `ReviewStatusScreen` (display saved result and status)
- [ ] **Task 14** – Add validation and error states (inline field errors, error dialogs, retry buttons)
- [ ] **Task 15** – Add offline/local persistence (AsyncStorage integration, sync status tracking)
- [ ] **Task 16** – Integrate navigation (add Camera Trap stack to `MainNavigator.js`, test navigation flow)
- [ ] **Task 17** – Add tests (domain, application, infrastructure, integration)
- [ ] **Task 18** – Verify complete workflow (end-to-end testing of all flows and alternate paths)
- [ ] **Task 19** – Document User Management integration points (prepare for future authentication/authorization)

---

## Future Enhancements

After initial implementation, consider:

- **Batch Review Mode** – Review multiple images in sequence without returning to list
- **Advanced Filtering** – Filter images by date range, review status, camera trap
- **Species Search** – Search/filter species list for faster classification
- **Image Annotations** – Draw bounding boxes around detected animals
- **Export Reports** – Generate PDF/CSV reports of classifications
- **Real-time Sync** – Upload classifications immediately when connectivity available
- **Collaborative Review** – Multiple reviewers working on same camera trap
- **Machine Learning Integration** – Pre-classify images with confidence scores

---

## References

### Project Documentation
- `/README.md` – Project overview, setup, architecture notes
- `/docs/architecture.md` – Log Incident architecture (reference for Camera Trap)
- `/docs/traceability.md` – Flow → screen → method → test traceability
- `/.kiro/steering/structure.md` – Folder structure conventions

### Existing Features
- `src/features/log-incident/` – Reference implementation for layered architecture
- `src/core/session/SessionContext.js` – Current session management
- `src/core/ui/` – Reusable UI components
- `src/core/constants/` – Shared constants (colors, strings)
- `src/navigation/MainNavigator.js` – Navigation structure

### Technology
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo SDK 57 Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

## Summary

This specification documents the **Review Camera Trap Images** feature for the Ranger App. It establishes:

1. **Clear ownership** – Camera Trap Review only, no other features
2. **User Management approach** – No authentication in current sprint, future integration documented
3. **Complete workflows** – Main flow, alternate flows (A1-A3), error flows (E1-E3)
4. **Six required screens** – CameraTrapList, CameraTrapImages, ImageReview, ClassifyWildlife, SuspiciousActivity, ReviewStatus
5. **Domain models** – CameraTrap, CameraTrapImage, WildlifeClassification, SuspiciousActivity
6. **Architecture** – Offline-first, layered (domain/ports/application/infrastructure/ui)
7. **Reusable components** – AppHeader, OfflineBanner, SyncStatusChip, buttons, etc.
8. **Team safety** – Guidelines for shared file modifications
9. **Out of scope** – Authentication, other features, full enforcement workflow
10. **Implementation checklist** – 19 tasks for future execution

This README serves as the **single source of truth** for Camera Trap Review implementation.

---

**Document Version:** 1.0  
**Last Updated:** 2026-09-27  
**Status:** Specification Complete – Ready for Implementation
