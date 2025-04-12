'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser = {
  email: 'demo@example.com',
  password: 'password123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const login = (email: string, password: string): boolean => {
    if (email === mockUser.email && password === mockUser.password) {
      setIsLoggedIn(true);
      router.push('/');
      return true;
    }
    return false;
  };

  return <AuthContext.Provider value={{ isLoggedIn, login }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
