import React, { createContext, useContext, useState, ReactNode } from 'react';

const API_URL = typeof window !== 'undefined' && !window.location.hostname.includes('localhost') ? '' : (import.meta.env.VITE_API_URL || '');

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profile: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Real login via backend → Supabase Auth
  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    const newUser: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name || email.split('@')[0],
      phone: data.user.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    };

    // Merge saved profile data if exists
    const savedProfile = localStorage.getItem(`profile_${newUser.id}`);
    if (savedProfile) {
      Object.assign(newUser, JSON.parse(savedProfile));
    }

    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Real signup via backend → Supabase Auth
  const signup = async (email: string, password: string, name: string, phone: string) => {
    if (!email || !password || !name || !phone) {
      throw new Error('All fields are required');
    }

    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');

    const newUser: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name || name,
      phone: data.user.phone || phone,
      address: '',
      city: '',
      state: '',
      pincode: '',
    };

    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserProfile = (profile: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...profile };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      // Also save profile separately keyed by user ID for persistence across logins
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUserProfile,
      }}
    >
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
