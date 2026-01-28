# Setup New Firebase Database - Step by Step Guide

## ✅ Configuration Files Updated

I've updated your configuration files with the new Firebase project:
- **Project ID:** `yogafloww-474eb`
- **Environment variables:** Updated in `.env` file
- **Firebase project reference:** Updated in `.firebaserc`

## 🔥 Next Steps to Complete Setup

### Step 1: Enable Firestore in Native Mode (CRITICAL)

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/project/yogafloww-474eb/firestore

2. **Create Database:**
   - Click **"Create database"** button
   - Select **"Start in production mode"** or **"Start in test mode"**
   - **IMPORTANT:** Choose **"Native mode"** (NOT Datastore mode)
   - Select a location (e.g., `us-central1` or `asia-south1`)
   - Click **"Enable"**

3. **Wait for Database to Initialize:**
   - This may take 1-2 minutes
   - You'll see "Firestore Database" when ready

### Step 2: Deploy Firestore Security Rules

**Option A: Using Firebase CLI (Recommended)**

```bash
# Make sure you're in the project directory
cd "/Users/vyoumagarwaal/Downloads/yoga-flow (1)"

# Login to Firebase (if not already logged in)
firebase login

# Deploy the security rules
firebase deploy --only firestore:rules
```

**Option B: Manual Deployment**

1. Go to: https://console.firebase.google.com/project/yogafloww-474eb/firestore/rules
2. Copy ALL content from `firestore.rules` file
3. Paste into the Firebase Console editor
4. Click **"Publish"**

### Step 3: Verify Environment Variables

Make sure your `.env` file exists and contains:

```env
VITE_FIREBASE_API_KEY=AIzaSyBqHky1eiDZXr3D2q5d3bXSc0OaexmmTYg
VITE_FIREBASE_AUTH_DOMAIN=yogafloww-474eb.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yogafloww-474eb
VITE_FIREBASE_STORAGE_BUCKET=yogafloww-474eb.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=733940796391
VITE_FIREBASE_APP_ID=1:733940796391:web:40371549c0dca88f3d8b42
VITE_FIREBASE_MEASUREMENT_ID=G-VQEZFLCV9X
```

**Important:** After updating `.env`, restart your dev server:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test the Connection

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser console (F12)** and check for:
   - `🔥 Firebase Config:` with projectId: `yogafloww-474eb`
   - `✅ Firestore is accessible!`

3. **Test saving data:**
   - Go to `/admin`
   - Try saving an asana or instructor
   - Check console for success messages

### Step 5: Verify Data is Saving

1. **Check Firestore Console:**
   - Go to: https://console.firebase.google.com/project/yogafloww-474eb/firestore/data
   - You should see collections: `asanas`, `instructors`, etc.

2. **Check Browser Console:**
   - Look for: `✅ Asana saved successfully to Firestore`
   - No timeout or permission errors

## 🔍 Troubleshooting

### If you see "permission-denied":
- Rules not deployed → Deploy rules (Step 2)
- Check rules are published in Firebase Console

### If you see timeouts:
- Firestore not enabled → Enable Firestore (Step 1)
- Wrong mode → Must be Native mode, not Datastore
- Network issues → Check internet connection

### If environment variables not loading:
- Restart dev server after updating `.env`
- Check `.env` file is in project root
- Verify all variables start with `VITE_`

## ✅ Checklist

Before testing, make sure:

- [ ] Firestore is enabled in Firebase Console
- [ ] Firestore is in **Native mode** (not Datastore)
- [ ] Security rules are deployed
- [ ] `.env` file has correct values
- [ ] Dev server restarted after `.env` update
- [ ] Browser console shows correct project ID

## 🎯 Expected Result

After completing these steps:
- ✅ Data saves without timeouts
- ✅ Collections appear in Firestore Console
- ✅ No permission errors
- ✅ Admin dashboard works correctly

---

**Quick Test:**
1. Enable Firestore (Native mode)
2. Deploy rules
3. Restart dev server
4. Try saving an asana
5. Check Firestore Console for the saved document

Good luck! 🚀
