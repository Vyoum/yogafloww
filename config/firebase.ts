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

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

// Initialize Firebase (throws if config invalid; Error Boundary will show message)
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore with connection settings
const db = getFirestore(app);

// Configure Firestore settings for better timeout handling
if (typeof window !== 'undefined' && isFirebaseConfigured) {
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
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('🔥 Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    isConfigured: isFirebaseConfigured,
  });
}

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined' && isFirebaseConfigured && firebaseConfig.measurementId) {
  analytics = getAnalytics(app);
}

export { app, analytics, auth, googleProvider, db, isFirebaseConfigured };
