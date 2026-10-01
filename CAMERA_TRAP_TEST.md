# Camera Trap Feature - Test Guide

## ✅ What Was Created

1. **Dashboard**: `src/screens/CameraTrapDashboard.js`
   - Landing screen for the Park Manager after login

2. **Screen**: `src/features/camera-trap/ui/screens/CameraTrapListScreen.js`
   - Shows 3 mock camera traps with pending images
   - Has role-based access control

3. **Navigation**: `src/navigation/CameraTrapNavigator.js`
   - Park Manager bottom tabs: **Camera Traps** and **Profile**
   - Camera Traps tab: Dashboard → Camera Trap List
   - Profile tab: `ManagerProfileScreen.js` (profile details + Logout)
   - Rangers and Villagers have no camera trap entry

4. **Test Account** (hardcoded in AuthContext):
   - Park Manager: `manager@example.com` / `Manager1!`

---

## 🧪 How to Test

### Step 1: Run the App
```bash
npm start
```
Scan QR code with Expo Go on your phone

### Step 2: Login with Park Manager
1. Open the app
2. Navigate to Login screen
3. Use credentials:
   - Email: `manager@example.com`
   - Password: `Manager1!`
4. Login
5. You should see the Camera Trap dashboard with:
   - Welcome message with your name
   - "Park Manager" role
   - Park: `PARK-YALA`
   - Camera trap and pending image counts
   - Two bottom tabs: **Camera Traps** and **Profile**
6. Tap the **Profile** tab → shows your name, email, ID and park, with a Logout button

### Step 3: Access Camera Traps
1. On the **Camera Traps** tab, tap **"View Camera Traps"**
2. You should see:
   - Welcome message with your name
   - Your role (park_manager)
   - 3 camera trap cards
3. Tap the back arrow → returns to the dashboard

### Step 4: Test Camera Trap Cards
Each card shows:
- Camera name (e.g., "North Trail Camera")
- Camera ID (e.g., "CT-001")
- Location (e.g., "North Trail Intersection")
- Pending image count (counted from the camera's images)
- Status badge ("ACTIVE")
- Last image timestamp

Tap a card → opens that camera's images

### Step 5: Review Images (main flow)
1. Tap **North Trail Camera** → grid of 4 images, each with a status chip
   (3 Pending, 1 Classified)
2. Tap a **Pending** image → Review Image screen shows the image, camera,
   capture time, GPS location and status
3. Tap **Classify Wildlife**
   - Tap **Save** without choosing a species → "Species is required"
   - Choose "Sri Lankan Elephant", set count to `4`, tap **Save**
4. Review Saved screen shows "Species: Sri Lankan Elephant, Count: 4" and a
   Classified chip
5. Tap **Next Image** → opens the next pending image
6. Tap **Mark as Unclear** → confirm → Review Saved shows "marked as unclear"
7. Tap **Back to Camera Trap** → the grid shows the new statuses
8. Go back to the list and the dashboard → pending counts have gone down

### Step 6: Review Suspicious Activity
1. Open **South Border** → tap the pending image → **Review Suspicious Activity**
2. Choose **Suspicious** → the Reason list and Notes field appear
   - Tap **Flag Image** without a reason → "Reason is required..."
   - Choose "Unauthorized Entry", add a note, tap **Flag Image**
3. Review Saved shows "Image flagged for enforcement review" and a Flagged chip
4. On another pending image choose **Not Suspicious** → saved, and the image
   keeps its current status (no enforcement review is created)
5. Choose **Unclear** on another → the image becomes Unclear

### Step 7: Reviews Are Kept
1. Close the app fully and open it again (or logout and login)
2. The statuses and pending counts you saved are still there

To start again with fresh data, clear the Expo Go app data (or uninstall and
reinstall Expo Go).

### Step 8: Image Load Error
1. Turn on airplane mode and open an image you have not opened before
2. You should see "Unable to load image. Please check your connection." and a
   **Retry** button; the review buttons still work
3. Turn airplane mode off and tap **Retry**

### Step 9: Test Access Control
1. Logout
2. Login with a verified Ranger account
   - The tab bar should have **no** Camera Traps tab
3. Logout and login with a Villager account
   - There should be no camera trap entry anywhere

### Step 10: Run the Automated Tests
```bash
npm test
```
- `permissions.test.js` checks that only `park_manager` can review camera traps.
- `imageReviewService.test.js` checks classify, unclear and suspicious reviews,
  and that saved reviews are not overwritten when images are reloaded.

---

## 📝 What You'll See

### Camera Trap Cards (before any review):
1. **North Trail Camera (CT-001)**
   - 4 images, 3 pending
   - North Trail Intersection

2. **Waterhole Monitor (CT-002)**
   - 3 images, 2 pending
   - Main Waterhole

3. **South Border (CT-003)**
   - 2 images, 1 pending
   - South Border Patrol Point

Dashboard totals: 3 camera traps, 6 pending images.

### Access Control:
- ✅ **Park Manager** → Can access
- ❌ **Ranger (officer)** → No access
- ❌ **Villager (community)** → No access
- ❌ **Admin** → No access
- ❌ **Not logged in** → Login required

---

## 🎯 Next Steps

1. Add the Park Manager role to registration (replaces the hardcoded test account)
2. Replace `MockCameraTrapGateway` with a real backend
3. Pinch-to-zoom on the review image

---

## 🐛 Troubleshooting

**If you don't see the Camera Trap dashboard after login:**
- Check if the app reloaded after file changes
- Try pressing `r` in the Expo terminal to reload
- Check for any red error screens

**If you see "Access Denied":**
- Make sure you're logged in with the Park Manager credentials
- Check the role displayed on the error screen

**If login doesn't work:**
- Make sure you're using the exact credentials (case-sensitive)
- Password must include the exclamation mark: `Manager1!`

---

## 📦 Files Modified

1. `src/context/AuthContext.js` - Added Park Manager test account
2. `src/navigation/RootNavigator.js` - Routes Park Manager to the camera trap stack
3. `src/navigation/CameraTrapNavigator.js` - NEW
4. `src/screens/CameraTrapDashboard.js` - NEW
5. `src/features/camera-trap/domain/permissions.js` - NEW
6. `src/features/camera-trap/ui/screens/` - NEW: `CameraTrapListScreen`, `CameraTrapImagesScreen`, `ImageReviewScreen`, `ClassifyWildlifeScreen`, `SuspiciousActivityScreen`, `ReviewStatusScreen`, `ManagerProfileScreen`
7. `CAMERA_TRAP_TEST.md` - This file
