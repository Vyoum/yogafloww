# Admin Dashboard Guide

## ✅ What I Fixed

1. **Admin Dashboard now loads users from Firestore** - Previously it was only showing localStorage users (empty!)
2. **Contact form submissions** - Now loads from Firestore `contact_form` collection
3. **Newsletter subscribers** - Now loads from Firestore `newsletter_subscribers` collection
4. **Better error handling** - Added comprehensive logging to debug issues

## 🔐 How to Access Admin Dashboard

### Step 1: Add Your Email as Admin

Add your email to `.env` file:

```bash
VITE_ADMIN_EMAILS=youremail@gmail.com
```

Or multiple emails (comma-separated):
```bash
VITE_ADMIN_EMAILS=admin@yogaflow.com,youremail@gmail.com,another@email.com
```

### Step 2: Restart Dev Server

After adding your email, restart the dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 3: Sign In

1. Go to: http://localhost:3000/admin
2. Click "Sign in" button
3. Sign in with your email (the one you added to `VITE_ADMIN_EMAILS`)
4. You should now see the admin dashboard!

## 📊 What You Can See

### Overview Tab
- Total Users count
- Contact Submissions count
- Newsletter Subscribers count
- Active Subscriptions count

### Users Tab
- **All users from Firestore** (`users` collection)
- Search by name or email
- Filter by source (Firebase vs localStorage)
- View join date, plan, etc.

### Contact Tab
- All contact form submissions
- Search by name, email, or message
- View inquiry type and timestamp

### Newsletter Tab
- All newsletter subscribers
- Search by email
- Export to CSV (button ready)

## 🔍 Debugging

If you can't access `/admin`:

1. **Check browser console (F12)**
   - Look for logs: `✅ Admin authenticated, loading data...`
   - Or errors: `⚠️ Not admin, skipping data load`

2. **Verify your email is in `.env`**
   ```bash
   cat .env | grep VITE_ADMIN_EMAILS
   ```

3. **Check if you're signed in**
   - The dashboard shows a login screen if not authenticated
   - Sign in first, then check if you're admin

4. **Check Firestore Rules**
   - Admins need read access to `users`, `contact_form`, `newsletter_subscribers`
   - Current rules allow admins to read all collections

## 🚨 Common Issues

### "Access denied" message
- Your email is not in `VITE_ADMIN_EMAILS`
- Add it to `.env` and restart server

### Empty users list
- Check browser console for errors
- Verify Firestore rules allow admin reads
- Check if `users` collection exists in Firestore

### Dashboard not loading
- Check browser console for errors
- Verify you're signed in
- Check network tab for Firestore requests

## 📝 Next Steps

1. **Deploy Firestore rules** (if not done)
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Test the dashboard**
   - Sign in with admin email
   - Check if users appear
   - Check if contact forms appear
   - Check if newsletter subscribers appear

3. **Tighten security** (after testing)
   - Once everything works, we can make rules more secure
