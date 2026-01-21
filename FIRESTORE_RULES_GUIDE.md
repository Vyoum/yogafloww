# Firebase Firestore Security Rules Guide

## Overview
This document contains the Firestore security rules for the Yoga Flow application. These rules control who can read, write, update, and delete data in your Firestore database.

## Collections

### 1. `contact_form`
**Purpose**: Stores contact form submissions from the website.

**Operations**:
- **Create (Write)**: ✅ Anyone (public) - Users can submit contact forms
- **Read**: ✅ Admins only - Only admin users can view submissions
- **Update**: ✅ Admins only - Admins can update status (new → read → replied)
- **Delete**: ✅ Admins only - Admins can delete submissions

**Data Validation**:
- `name`: String, 1-200 characters, required
- `email`: String, valid email format, max 200 characters, required
- `inquiryType`: String, 1-100 characters, required
- `message`: String, 1-5000 characters, required
- `status`: String, must be one of: 'new', 'read', 'replied', required
- `source`: String, max 100 characters, optional
- `createdAt`: String (ISO date), required
- `timestamp`: Server timestamp, required

### 2. `newsletter_subscribers`
**Purpose**: Stores newsletter subscription emails.

**Operations**:
- **Create (Write)**: ✅ Anyone (public) - Users can subscribe to newsletter
- **Read**: ✅ Admins only - Only admin users can view subscribers
- **Update**: ✅ Admins only - Admins can update subscription data
- **Delete**: ✅ Admins only - Admins can manage unsubscribes

**Data Validation**:
- `email`: String, valid email format, max 200 characters, required
- `subscribedAt`: Server timestamp, required
- `source`: String, max 100 characters, optional (defaults to 'website_footer')

### 3. `users` (Future Use)
**Purpose**: Store additional user profile data (currently using Firebase Auth + localStorage).

**Operations**:
- **Read**: ✅ Users can read their own data, Admins can read all
- **Create**: ✅ Users can create their own profile
- **Update**: ✅ Users can update their own profile, Admins can update any
- **Delete**: ✅ Users can delete their own account, Admins can delete any

**Data Validation**:
- `email`: String, valid email format, required (immutable after creation)
- `name`: String, 1-200 characters, required
- `id`: String, must match user's auth UID (immutable)

## Admin Access

Admins are identified by email addresses ending with `@yogaflow.com` or specific emails:
- `admin@yogaflow.com`
- `support@yogaflow.com`

To add more admin emails, update the `isAdmin()` function in the rules file.

## How to Deploy Rules

### Option 1: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`yogaflow-109d7`)
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy and paste the contents of `firestore.rules`
5. Click **Publish**

### Option 2: Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### Option 3: Direct Copy-Paste
1. Open `firestore.rules` file
2. Copy all contents
3. Go to Firebase Console → Firestore Database → Rules
4. Paste and click **Publish**

## Testing Rules

### Test Contact Form Submission (Should Succeed)
```javascript
// This should work for any user (authenticated or not)
db.collection('contact_form').add({
  name: "John Doe",
  email: "john@example.com",
  inquiryType: "General Inquiry",
  message: "Test message",
  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  status: "new",
  createdAt: new Date().toISOString(),
  source: "website_contact_form"
});
```

### Test Admin Read (Should Succeed for Admins)
```javascript
// This should work only for admin users
db.collection('contact_form').get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.data());
    });
  });
```

### Test Non-Admin Read (Should Fail)
```javascript
// This should fail for non-admin users
db.collection('contact_form').get()
  .then(snapshot => {
    // This will throw a permission error
  })
  .catch(error => {
    console.error("Permission denied:", error);
  });
```

## Security Best Practices

1. **Never expose admin rules in client-side code** - Admin checks are done server-side via Firestore rules
2. **Validate all inputs** - Rules validate data structure and format
3. **Use server timestamps** - Always use `serverTimestamp()` for timestamps
4. **Limit data size** - Rules enforce maximum field lengths
5. **Regular audits** - Review and update rules periodically
6. **Test thoroughly** - Use Firebase Rules Playground to test rules before deploying

## Troubleshooting

### "Missing or insufficient permissions" Error
- Check if user is authenticated (for read operations)
- Verify admin email matches the rules
- Ensure data structure matches validation rules

### "Invalid data" Error
- Check field names match exactly
- Verify data types (string, number, etc.)
- Ensure required fields are present
- Check field length limits

### Admin Access Not Working
- Verify email ends with `@yogaflow.com` or matches exact admin emails
- Check Firebase Authentication email matches
- Ensure user is properly authenticated

## Updating Admin Emails

To add more admin emails, edit the `isAdmin()` function in `firestore.rules`:

```javascript
function isAdmin() {
  return request.auth != null && 
         request.auth.token.email != null &&
         (request.auth.token.email.matches('.*@yogaflow\\.com$') ||
          request.auth.token.email == 'admin@yogaflow.com' ||
          request.auth.token.email == 'support@yogaflow.com' ||
          request.auth.token.email == 'your-new-admin@yogaflow.com'); // Add here
}
```

## Support

For issues or questions about Firestore rules:
1. Check Firebase Console → Firestore → Rules for syntax errors
2. Use Firebase Rules Playground to test rules
3. Review Firebase documentation: https://firebase.google.com/docs/firestore/security/get-started
