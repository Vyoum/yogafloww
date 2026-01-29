// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Use empty string if env is missing so the app still loads (e.g. on domain without build env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? ''
};

// Initialize Firebase (throws if config invalid; Error Boundary will show message)
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore with connection settings
const db = getFirestore(app);

// Configure Firestore settings for better timeout handling
if (typeof window !== 'undefined') {
  // Enable offline persistence (helps with timeouts)
  import('firebase/firestore').then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(db).catch((err: any) => {
      if (err.code === 'failed-precondition') {
        console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('⚠️ The current browser does not support all of the features required for persistence');
      } else {
        console.warn('⚠️ Firestore persistence error:', err);
      }
    });
  }).catch(() => {
    // Ignore if persistence is not available
  });
}

// Debug: Log Firebase initialization and test connectivity
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: !!firebaseConfig.apiKey,
    apiKeyStart: firebaseConfig.apiKey?.substring(0, 10) + '...'
  });
  console.log('📦 Firestore db initialized:', !!db);
  console.log('📦 Firestore app name:', db.app.name);
  console.log('📦 Firestore app options:', db.app.options);
  
  // Test Firestore connectivity
  import('firebase/firestore').then(async ({ doc, getDoc }) => {
    try {
      console.log('🔍 Testing Firestore connectivity...');
      // Try to read a non-existent document (should return null, not error)
      const testRef = doc(db, '_test_connection_', 'test');
      const testSnap = await getDoc(testRef);
      console.log('✅ Firestore is accessible! (test doc exists:', testSnap.exists(), ')');
    } catch (error: any) {
      console.error('❌ Firestore connectivity test failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    }
  });
}

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics, auth, googleProvider, db };
