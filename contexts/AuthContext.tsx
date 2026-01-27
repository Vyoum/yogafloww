import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
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
        
        // Save/update user in Firestore
        try {
          console.log('👤 Saving user to Firestore:', firebaseUser.uid);
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // New user - create document
            console.log('✨ Creating new user document');
            await setDoc(userRef, {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              joinDate: firebaseUser.metadata.creationTime || serverTimestamp(),
              createdAt: serverTimestamp(),
              authProvider: 'google',
              photoURL: firebaseUser.photoURL || null,
            });
            console.log('✅ User document created successfully');
          } else {
            // Existing user - update last login
            console.log('🔄 Updating existing user document');
            await setDoc(userRef, {
              name: firebaseUser.displayName || userDoc.data().name || 'User',
              email: firebaseUser.email || userDoc.data().email || '',
              photoURL: firebaseUser.photoURL || userDoc.data().photoURL || null,
              lastLoginAt: serverTimestamp(),
            }, { merge: true });
            console.log('✅ User document updated successfully');
          }
        } catch (error: any) {
          console.error('❌ Error saving user to Firestore:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
        }
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
    // Check localStorage for existing users
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
      
      // Update Firestore with last login time
      try {
        console.log('👤 Updating user in Firestore on login:', foundUser.id);
        const userRef = doc(db, 'users', foundUser.id);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Update last login
          console.log('🔄 Updating last login time');
          await setDoc(userRef, {
            lastLoginAt: serverTimestamp(),
            plan: foundUser.plan || null,
          }, { merge: true });
          console.log('✅ User updated successfully');
        } else {
          // User exists in localStorage but not in Firestore - create it
          console.log('✨ Creating user document from localStorage data');
          await setDoc(userRef, {
            name: foundUser.name,
            email: foundUser.email.toLowerCase().trim(),
            joinDate: foundUser.joinDate || serverTimestamp(),
            createdAt: serverTimestamp(),
            authProvider: 'email',
            plan: foundUser.plan || null,
            lastLoginAt: serverTimestamp(),
          });
          console.log('✅ User created successfully');
        }
      } catch (error: any) {
        console.error('❌ Error updating user in Firestore:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        // Don't fail login if Firestore fails
      }
      
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Check localStorage for existing users
    const users = JSON.parse(localStorage.getItem('yogaFlowUsers') || '[]');
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return false;
    }

    const userId = Date.now().toString();
    const joinDate = new Date().toISOString();
    
    const newUser = {
      id: userId,
      name,
      email,
      password, // In production, this should be hashed
      joinDate,
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
    
    // Save user to Firestore
    try {
      console.log('👤 Saving new email/password user to Firestore:', userId);
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        name,
        email: email.toLowerCase().trim(),
        joinDate,
        createdAt: serverTimestamp(),
        authProvider: 'email',
        plan: null,
      });
      console.log('✅ User saved to Firestore successfully');
    } catch (error: any) {
      console.error('❌ Error saving user to Firestore:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      // Don't fail signup if Firestore fails, localStorage is the fallback
    }
    
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
