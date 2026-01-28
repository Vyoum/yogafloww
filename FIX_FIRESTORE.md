# Fix Firestore Database Issues - Step by Step Guide

## The Main Problem
**Your Firestore security rules are NOT deployed to Firebase.** The local `firestore.rules` file has no effect until you deploy it.

## Step 1: Deploy Firestore Rules (CRITICAL)

### Method A: Using Firebase CLI (Recommended)

```bash
# 1. Make sure you're in the project directory
cd "/Users/vyoumagarwaal/Downloads/yoga-flow (1)"

# 2. Check if Firebase CLI is installed
firebase --version

# If not installed, install it:
npm install -g firebase-tools

# 3. Login to Firebase (if not already logged in)
firebase login

# 4. Deploy ONLY the Firestore rules
firebase deploy --only firestore:rules
```

**Expected Output:**
```
✔  firestore: rules have been deployed successfully
✔  Deploy complete!
```

### Method B: Manual Deployment via Firebase Console

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/project/yogafloww-77df7/firestore/rules

2. **Copy Rules:**
   - Open `firestore.rules` file in your project
   - Copy ALL the content

3. **Paste and Publish:**
   - Paste into the Firebase Console editor
   - Click **"Publish"** button
   - Wait for confirmation message

## Step 2: Verify Rules Are Deployed

1. Go to: https://console.firebase.google.com/project/yogafloww-77df7/firestore/rules
2. You should see the rules you just deployed
3. Check the timestamp - it should show "Last published: [recent time]"

## Step 3: Test Saving Data

### Test 1: Save an Asana
1. Go to `/admin` in your app
2. Click "Asanas" tab
3. Click "Add New Asana" or "Edit" on an existing asana
4. Fill in the form and click "Create Asana" or "Update Asana"
5. **Open Browser Console (F12)** and look for:
   - `💾 Attempting to save asana:`
   - `✅ Asana saved successfully to Firestore:`
   - OR `❌ Error saving asana:` with error details

### Test 2: Save an Instructor
1. Go to `/admin` → "Instructors Management"
2. Click "Add New Instructor" or "Edit" on an existing instructor
3. Fill in the form and click "Create Instructor" or "Update Instructor"
4. **Check Browser Console** for success/error messages

## Step 4: Check Firestore Console

1. Go to: https://console.firebase.google.com/project/yogafloww-77df7/firestore/data
2. Look for collections:
   - `asanas` - should contain your saved asanas
   - `instructors` - should contain your saved instructors
   - `class_videos` - for class video URLs
   - `settings` - for app settings

## Common Errors and Solutions

### Error: "permission-denied"
**Cause:** Rules not deployed or too restrictive
**Solution:** 
- Deploy rules using Step 1 above
- Make sure rules have `allow write: if true;` for testing

### Error: "unavailable" or timeout
**Cause:** Network issue or Firebase project not accessible
**Solution:**
- Check internet connection
- Verify Firebase project ID in `.env` matches `yogafloww-77df7`
- Check Firebase Console to ensure project is active

### Error: "failed-precondition"
**Cause:** Missing Firestore indexes
**Solution:**
- Firebase will show a link to create the index
- Click the link and wait for index to build (can take a few minutes)

### No Error, But Data Not Appearing
**Cause:** Rules deployed but collection name mismatch
**Solution:**
- Check collection names match exactly:
  - `asanas` (not `asana`)
  - `instructors` (not `instructor`)
  - `class_videos` (not `class_video`)

## Current Rules Status

The rules are now **VERY PERMISSIVE** for testing:
- ✅ `asanas` - Anyone can read/write
- ✅ `instructors` - Anyone can read/write
- ✅ `class_videos` - Anyone can read/write
- ✅ `settings` - Anyone can read/write
- ✅ `contact_form` - Anyone can create
- ✅ `newsletter_subscribers` - Anyone can create
- ✅ `users` - Anyone can create

**⚠️ WARNING:** These rules are for testing only. After confirming everything works, we'll add proper authentication checks.

## Debug Checklist

After deploying rules, check:

- [ ] Rules show as "Published" in Firebase Console
- [ ] Browser console shows `✅ Asana saved successfully` (not errors)
- [ ] Firestore Console shows documents in `asanas` collection
- [ ] Firestore Console shows documents in `instructors` collection
- [ ] No "permission-denied" errors in console

## Still Not Working?

If data still isn't saving after deploying rules:

1. **Share Browser Console Output:**
   - Open F12 → Console tab
   - Try saving an asana/instructor
   - Copy ALL console messages (especially those with 🔥, 💾, ✅, ❌)

2. **Share Firebase Console Screenshot:**
   - Go to Firestore Rules page
   - Screenshot showing the deployed rules

3. **Check Environment Variables:**
   - Verify `.env` file has correct Firebase config
   - All variables should start with `VITE_`

4. **Test Direct Connection:**
   - Open browser console
   - Type: `console.log(window.location.href)`
   - Make sure you're on the correct domain

---

**Next Steps After Fix:**
1. Test saving asanas ✅
2. Test saving instructors ✅
3. Test saving class videos ✅
4. Once confirmed working, we'll tighten security rules
