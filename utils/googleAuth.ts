// Google Sign-In Utility
// Note: In production, you'll need to:
// 1. Get a Google OAuth Client ID from Google Cloud Console
// 2. Add your domain to authorized origins
// 3. Replace this mock implementation with real Google Identity Services

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // Replace with your actual Client ID

export const loadGoogleScript = (callback: () => void) => {
  if (window.google) {
    callback();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = callback;
  script.onerror = () => {
    console.error('Failed to load Google Identity Services');
  };
  document.body.appendChild(script);
};

export const initializeGoogleSignIn = (
  onSuccess: (credential: { name: string; email: string; picture?: string }) => void,
  onError: (error: string) => void
) => {
  loadGoogleScript(() => {
    if (!window.google) {
      onError('Google Sign-In failed to load');
      return;
    }

    // For demo purposes, we'll use a mock implementation
    // In production, use Google Identity Services properly
    const mockGoogleSignIn = () => {
      // This is a mock - in production, you'd use the actual Google Sign-In flow
      // For now, we'll simulate it with a prompt
      const email = prompt('Enter your Google email (demo mode):');
      const name = prompt('Enter your name (demo mode):') || 'User';
      
      if (email) {
        onSuccess({
          name,
          email,
          picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d9488&color=fff&size=128`,
        });
      } else {
        onError('Sign-in cancelled');
      }
    };

    // Try to use real Google Sign-In if available
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          // In production, decode the JWT token and extract user info
          // For now, use mock
          mockGoogleSignIn();
        },
      });
    } catch (e) {
      // Fallback to mock if Google Sign-In not properly configured
      console.warn('Google Sign-In not configured, using mock');
    }
  });
};

// Simplified Google Sign-In button handler
export const handleGoogleSignIn = (
  onSuccess: (user: { name: string; email: string; picture?: string }) => void,
  onError: (error: string) => void
) => {
  // For demo: simulate Google Sign-In
  // In production, this would trigger the actual Google OAuth flow
  const email = prompt('Enter your Google email (demo mode):');
  const name = prompt('Enter your name (demo mode):') || 'User';
  
  if (email && name) {
    onSuccess({
      name,
      email,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d9488&color=fff&size=128`,
    });
  } else {
    onError('Sign-in cancelled');
  }
};
