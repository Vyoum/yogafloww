# Fix Firestore Timeout Issues

## The Problem
You're experiencing timeouts when trying to save data to Firestore, even though rules are deployed.

## Common Causes of Timeouts

### 1. Firestore Database Not Enabled or Wrong Mode
**Most Common Issue:** Firestore might not be initialized or might be in Datastore mode instead of Native mode.

**Check:**
1. Go to: https://console.firebase.google.com/project/yogafloww-77df7/firestore
2. If you see "Create database" button → Click it and select **"Start in production mode"** or **"Start in test mode"**
3. **IMPORTANT:** Select **"Native mode"** (NOT Datastore mode)
4. Choose a location (e.g., `us-central1` or `asia-south1`)
5. Click "Enable"

### 2. Network/Firewall Issues
- Check if your network/firewall is blocking Firebase
- Try from a different network (mobile hotspot)
- Check browser console for CORS errors

### 3. Firebase Project Configuration
- Verify all environment variables are correct
- Check if Firebase project is active (not suspended)

## Step-by-Step Fix

### Step 1: Verify Firestore is Enabled

1. **Open Firebase Console:**
   - https://console.firebase.google.com/project/yogafloww-77df7/firestore

2. **Check Database Status:**
   - If you see "Create database" → Click and create it
   - If you see "Firestore Database" → Good, it's enabled
   - If you see "Cloud Datastore" → This is the problem! You need Native Firestore

3. **If in Datastore Mode:**
   - You cannot switch from Datastore to Native mode
   - You need to create a NEW Firestore database in Native mode
   - Or use a different Firebase project

### Step 2: Check Database Location

1. In Firebase Console → Firestore → Settings
2. Note the database location
3. Make sure it's accessible from your region

### Step 3: Test Connection

Open browser console (F12) and run:

```javascript
// Test Firestore connection
import { doc, getDoc } from 'firebase/firestore';
const testRef = doc(db, '_test', 'connection');
getDoc(testRef).then(() => {
  console.log('✅ Connection works!');
}).catch(err => {
  console.error('❌ Connection failed:', err);
});
```

### Step 4: Check Browser Console Errors

When you try to save, check for:
- `❌ Error saving...` messages
- Network errors in Network tab
- CORS errors
- Timeout errors

## What I've Added to Fix Timeouts

### 1. Retry Logic with Exponential Backoff
- Automatically retries failed saves up to 3 times
- Waits longer between each retry (1s, 2s, 4s)

### 2. Connection Testing
- Tests Firestore connection before saving
- Helps identify connection issues early

### 3. Better Timeout Handling
- 30-second timeout per attempt
- Clear error messages for timeout issues

### 4. Offline Persistence
- Enables offline caching (helps with intermittent connectivity)

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Firestore is enabled in Firebase Console
- [ ] Firestore is in **Native mode** (not Datastore)
- [ ] Database location is set and accessible
- [ ] Security rules are published (check timestamp)
- [ ] Environment variables are correct (check `.env` file)
- [ ] No firewall blocking Firebase
- [ ] Browser console shows connection test passing
- [ ] Network tab shows requests to `firestore.googleapis.com`

## If Still Timing Out

### Option 1: Check Firestore Mode
1. Go to: https://console.firebase.google.com/project/yogafloww-77df7/firestore/settings
2. Look for "Database mode"
3. Must say "Native mode" (not "Datastore mode")

### Option 2: Create New Database
If you're in Datastore mode:
1. You cannot convert Datastore → Native
2. Create a new Firebase project
3. Enable Firestore in Native mode
4. Update `.env` with new project credentials

### Option 3: Check Network
1. Open browser DevTools → Network tab
2. Try saving an asana
3. Look for requests to `firestore.googleapis.com`
4. Check if they're pending/timing out
5. Check response status codes

### Option 4: Test with Simple Write
Open browser console and try:

```javascript
import { doc, setDoc } from 'firebase/firestore';
const testRef = doc(db, 'test', 'simple');
setDoc(testRef, { test: 'data', timestamp: new Date() })
  .then(() => console.log('✅ Simple write works!'))
  .catch(err => console.error('❌ Simple write failed:', err));
```

## Expected Behavior After Fix

When saving works correctly, you should see in console:
1. `💾 Attempting to save...`
2. `✅ Firestore connection test passed`
3. `📝 Document reference created: asanas/...`
4. `🔄 Save asana ... - Attempt 1/3`
5. `✅ Save asana ... - Success on attempt 1`
6. `✅ Asana saved successfully to Firestore: ...`
7. Alert: "Asana saved successfully!"

## Still Having Issues?

Share:
1. **Screenshot of Firestore Console** showing database mode
2. **Browser console output** when trying to save
3. **Network tab** showing Firestore requests
4. **Error message** from the alert

---

**Most Likely Fix:** Ensure Firestore is enabled in **Native mode** (not Datastore mode) in Firebase Console.
