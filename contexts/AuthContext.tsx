import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  plan?: string;
  joinDate?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (googleUser: { name: string; email: string; picture?: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          joinDate: firebaseUser.metadata.creationTime || new Date().toISOString(),
        };
        setUser(userData);
        localStorage.setItem('yogaFlowUser', JSON.stringify(userData));
      } else {
        // User is signed out, check localStorage for manual login
        const savedUser = localStorage.getItem('yogaFlowUser');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            // Only use localStorage user if it's not a Firebase user (has password)
            const users = JSON.parse(localStorage.getItem('yogaFlowUsers') || '[]');
            const foundUser = users.find((u: any) => u.email === parsedUser.email);
            if (foundUser && foundUser.password) {
              setUser(parsedUser);
            } else {
              setUser(null);
              localStorage.removeItem('yogaFlowUser');
            }
          } catch (e) {
            console.error('Error loading user data:', e);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call
    // For now, we'll check localStorage for existing users
    const users = JSON.parse(localStorage.getItem('yogaFlowUsers') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        plan: foundUser.plan,
        joinDate: foundUser.joinDate,
      };
      setUser(userData);
      localStorage.setItem('yogaFlowUser', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call
    // For now, we'll store in localStorage
    const users = JSON.parse(localStorage.getItem('yogaFlowUsers') || '[]');
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In production, this should be hashed
      joinDate: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('yogaFlowUsers', JSON.stringify(users));

    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      joinDate: newUser.joinDate,
    };
    setUser(userData);
    localStorage.setItem('yogaFlowUser', JSON.stringify(userData));
    return true;
  };

  const loginWithGoogle = async (googleUser: { name: string; email: string; picture?: string }): Promise<boolean> => {
    // This function is called after successful Firebase Google Sign-In
    // The user state is already updated by onAuthStateChanged listener
    // We just need to return true to indicate success
    // The actual authentication is handled by Firebase in handleGoogleSignIn
    return true;
  };

  const logout = async () => {
    try {
      // Sign out from Firebase if user is signed in with Firebase
      const currentUser = auth.currentUser;
      if (currentUser) {
        await firebaseSignOut(auth);
      }
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }
    
    // Clear local state
    setUser(null);
    localStorage.removeItem('yogaFlowUser');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      loginWithGoogle,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
