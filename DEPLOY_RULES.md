# Deploy Firestore Rules - CRITICAL STEP

## The Problem
Your Firestore rules are NOT deployed. The local `firestore.rules` file has NO EFFECT until you deploy it to Firebase.

## Solution: Deploy Rules Now

### Option 1: Deploy via Firebase CLI (Recommended)

```bash
# 1. Install Firebase CLI globally
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Deploy rules (you're already initialized with .firebaserc and firebase.json)
firebase deploy --only firestore:rules
```

You should see:
```
✔  Deploy complete!
```

### Option 2: Manual Deployment via Firebase Console

1. Open: https://console.firebase.google.com/project/yogafloww-77df7/firestore/rules
2. Copy ALL contents from `firestore.rules` file
3. Paste into the Firebase Console editor
4. Click **"Publish"** button
5. Wait for confirmation

## What I Changed

Made rules VERY PERMISSIVE for testing:

### Contact Form
- **Before**: Strict validation blocking writes
- **Now**: `allow create: if true;` (anyone can write)

### Newsletter
- **Before**: Strict timestamp validation
- **Now**: `allow create: if true;` (anyone can write)

### Users
- **Before**: Required authentication to create
- **Now**: `allow create: if true;` (anyone can write - needed for email/password signup)

## After Deploying

1. **Test Contact Form**
   - Fill out and submit
   - Open browser console (F12)
   - Look for logs with 🔥, 📝, ✅, ❌
   - Check Firebase Console: https://console.firebase.google.com/project/yogafloww-77df7/firestore/data

2. **Test User Signup**
   - Create new account (email/password)
   - Check console for 👤, ✅, ❌ logs
   - Check `users` collection in Firestore

3. **Test User Login with Google**
   - Sign in with Google
   - Check console logs
   - Check `users` collection in Firestore

## Debugging

If it still doesn't work after deploying, share:
1. Screenshot of Firebase Console Rules page (to confirm deployment)
2. Browser console errors (F12 → Console tab)
3. Which action is failing (contact form, signup, or login)

---

**⚠️ WARNING**: Current rules are VERY PERMISSIVE for testing. After confirming everything works, we'll tighten security.
