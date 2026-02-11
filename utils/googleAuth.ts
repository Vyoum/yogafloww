// Google Sign-In Utility using Firebase Authentication
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../config/firebase";

// Handle Google Sign-In using Firebase
export const handleGoogleSignIn = async (
  onSuccess: (user: { name: string; email: string; picture?: string }) => void,
  onError: (error: string) => void
) => {
  try {
    if (!isFirebaseConfigured) {
      onError('Google sign-in is not configured. Please set your VITE_FIREBASE_* environment variables.');
      return;
    }

    // Sign in with Google popup
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Extract user information
    const userData = {
      name: user.displayName || 'User',
      email: user.email || '',
      picture: user.photoURL || undefined,
    };

    onSuccess(userData);
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      onError('Sign-in cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      onError('Popup was blocked. Please allow popups for this site.');
    } else if (error.code === 'auth/network-request-failed') {
      onError('Network error. Please check your connection.');
    } else if (error.code === 'auth/operation-not-allowed') {
      onError('Google sign-in is disabled in Firebase. Enable the Google provider in Firebase Console.');
    } else if (error.code === 'auth/unauthorized-domain') {
      onError('This domain is not authorized for Google sign-in. Add it in Firebase Console → Auth → Settings → Authorized domains.');
    } else if (error.code === 'auth/invalid-api-key') {
      onError('Firebase configuration is invalid (API key). Check VITE_FIREBASE_API_KEY and restart the dev server.');
    } else {
      onError(error.message || 'Failed to sign in with Google. Please try again.');
    }
  }
};
