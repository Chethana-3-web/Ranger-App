# Camera Trap Feature - Test Guide

## ✅ What Was Created

1. **Screen**: `CameraTrapListScreen.js`
   - Location: `src/features/camera-trap/ui/screens/CameraTrapListScreen.js`
   - Shows 3 mock camera traps with pending images
   - Has role-based access control

2. **Navigation**: Added to bottom tab navigation
   - New tab: "Camera Traps" with camera icon
   - Located between "Incidents" and "Alerts"

3. **Test Accounts** (hardcoded in AuthContext):
   - Park Manager: `manager@example.com` / `Manager1!`
   - Researcher: `researcher@example.com` / `Research1!`

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

### Step 3: Access Camera Traps
1. Look at the bottom tab navigation
2. Tap the **"Camera Traps"** tab (camera icon)
3. You should see:
   - Welcome message with your name
   - Your role (park_manager)
   - 3 camera trap cards

### Step 4: Test Camera Trap Cards
Each card shows:
- Camera name (e.g., "North Trail Camera")
- Camera ID (e.g., "CT-001")
- Location (e.g., "North Trail Intersection")
- Pending image count (e.g., "8 pending images")
- Status badge ("ACTIVE")
- Last image timestamp

Tap a card → Alert popup shows camera details

### Step 5: Test Access Control
1. Logout
2. Login with a different role (e.g., Officer: `officer@example.com` / `Officer1!`)
3. Navigate to Camera Traps tab
4. You should see: **Access Denied** message
   - "Camera Trap Review is only accessible to Park Managers and Researchers"
   - Shows your current role

### Step 6: Test Researcher Account
1. Logout
2. Login with: `researcher@example.com` / `Research1!`
3. Navigate to Camera Traps tab
4. You should see the camera trap list (same as Park Manager)

---

## 📝 What You'll See

### Camera Trap Cards:
1. **North Trail Camera (CT-001)**
   - 8 pending images
   - North Trail Intersection

2. **Waterhole Camera (CT-002)**
   - 12 pending images
   - Main Waterhole

3. **South Border Camera (CT-003)**
   - 5 pending images
   - South Border Fence

### Access Control:
- ✅ **Park Manager** → Can access
- ✅ **Researcher** → Can access
- ❌ **Officer** → Access denied
- ❌ **Community** → Access denied
- ❌ **Not logged in** → Login required

---

## 🎯 Next Steps

After testing this screen, you can:
1. Create `CameraTrapImagesScreen` (show images for selected camera)
2. Create `ImageReviewScreen` (view single image)
3. Create `ClassifyWildlifeScreen` (species + count form)
4. Create `SuspiciousActivityScreen` (flag suspicious activity)
5. Connect all screens with navigation

---

## 🐛 Troubleshooting

**If you don't see the Camera Traps tab:**
- Check if the app reloaded after file changes
- Try pressing `r` in the Expo terminal to reload
- Check for any red error screens

**If you see "Access Denied":**
- Make sure you're logged in with Park Manager or Researcher credentials
- Check the role displayed on the error screen

**If login doesn't work:**
- Make sure you're using the exact credentials (case-sensitive)
- Password must include the exclamation mark: `Manager1!`

---

## 📦 Files Modified

1. `src/context/AuthContext.js` - Added Park Manager & Researcher accounts
2. `src/navigation/MainNavigator.js` - Added Camera Traps tab
3. `src/features/camera-trap/ui/screens/CameraTrapListScreen.js` - NEW
4. `CAMERA_TRAP_TEST.md` - This file

---

## ✨ Ready to Test!

Login as Park Manager and explore your first Camera Trap screen! 🎉
