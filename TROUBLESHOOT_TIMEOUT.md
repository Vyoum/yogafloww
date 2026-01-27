# Troubleshooting Firestore Timeout

## What's Happening
You're getting a timeout when trying to write to Firestore. The request hangs for 15 seconds then times out.

## Most Likely Causes

1. **Rules Not Actually Deployed** (90% chance)
   - You pasted them manually but they didn't save/publish
   - Or you're looking at the wrong project

2. **Network/Connectivity Issue** (5% chance)
   - Firewall blocking Firestore
   - Network connectivity problem

3. **Wrong Firebase Project** (5% chance)
   - ENV vars pointing to wrong project
   - Multiple Firebase projects

## Steps to Fix

### Step 1: Verify Rules are Deployed

1. Open: https://console.firebase.google.com/project/yogafloww-77df7/firestore/rules
2. You should see:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contact_form/{documentId} {
      allow create: if true;
      allow read: if isAdmin();
      ...
    }
  }
}
```

3. **Check the timestamp** at the top - it should say "Last deployed: a few moments ago"
4. If it's old, the rules are NOT deployed

### Step 2: Test with Standalone Page

1. Navigate to: http://localhost:3000/test-firestore.html (if dev server is running)
2. Or open `public/test-firestore.html` directly in browser
3. Click "Test Write to contact_form"
4. Check the result:
   - ✅ SUCCESS = Rules are deployed, app has a bug
   - ❌ Permission denied = Rules not deployed
   - ❌ Timeout = Network/connectivity issue

### Step 3: Check Browser Console

1. Open your app (http://localhost:3000)
2. Open DevTools (F12)
3. Go to Console tab
4. Look for these logs on page load:
   ```
   🔥 Firebase Config: {projectId: 'yogafloww-77df7', ...}
   📦 Firestore db initialized: true
   🔍 Testing Firestore connectivity...
   ✅ Firestore is accessible!
   ```

5. If you see errors, note them

### Step 4: Verify Network Tab

1. In DevTools, go to Network tab
2. Submit the contact form
3. Look for requests to `firestore.googleapis.com`
4. Check the status:
   - **Pending forever** = Rules blocking OR network issue
   - **403 Forbidden** = Rules not deployed properly
   - **200 OK** = Success!
   - **Failed** = Network connectivity issue

## Quick Fix Options

### Option A: Completely Open Rules (TESTING ONLY)

Temporarily make rules completely open:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Paste this in Firebase Console, click Publish, then test again.

⚠️ **Remember to revert this** - it allows anyone to read/write everything!

### Option B: Check ENV Variables

Verify `.env` matches Firebase Console project settings:

```bash
cat .env
```

Should show:
```
VITE_FIREBASE_PROJECT_ID=yogafloww-77df7
VITE_FIREBASE_API_KEY=AIzaSyDGerJtkEQz2RnvRoVgUxgLUXgjrG4MV4A
...
```

### Option C: Restart Dev Server

Sometimes Vite caches environment variables:

```bash
# Stop dev server (Ctrl+C)
npm run dev
```

## What I Changed

1. **Removed `serverTimestamp()`** - might have been causing issues
2. **Added 10s timeout** - so you get an error instead of hanging forever
3. **Added connectivity test** - runs automatically on page load
4. **Created test page** - standalone test without your app code

## Next Steps

1. Run the test page first
2. Share the exact error from:
   - Test page result
   - Browser console logs
   - Network tab status
3. Screenshot of Firebase Console Rules page showing deployment timestamp
