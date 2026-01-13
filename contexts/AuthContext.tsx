import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('yogaFlowUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    }
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
    // In a real app, this would verify the Google token with your backend
    // For now, we'll check if user exists or create a new one
    const users = JSON.parse(localStorage.getItem('yogaFlowUsers') || '[]');
    let foundUser = users.find((u: any) => u.email === googleUser.email);

    if (!foundUser) {
      // Create new user from Google account
      const newUser = {
        id: Date.now().toString(),
        name: googleUser.name,
        email: googleUser.email,
        password: null, // No password for Google users
        joinDate: new Date().toISOString(),
        provider: 'google',
        picture: googleUser.picture,
      };
      users.push(newUser);
      localStorage.setItem('yogaFlowUsers', JSON.stringify(users));
      foundUser = newUser;
    }

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
  };

  const logout = () => {
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
