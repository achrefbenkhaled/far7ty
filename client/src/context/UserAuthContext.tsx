import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { memoriesApi } from '../lib/memoriesApi';

type User = { id: string; name: string; email: string } | null;

type AuthContextType = {
  user: User;
  ready: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState(false);

  // On mount, validate any stored token
  useEffect(() => {
    const token = localStorage.getItem('invly_token');
    if (!token) {
      setReady(true);
      return;
    }
    memoriesApi
      .me()
      .then((res) => {
        setUser(res.user);
      })
      .catch(() => {
        localStorage.removeItem('invly_token');
      })
      .finally(() => setReady(true));
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const data = await memoriesApi.register(name, email, password);
    localStorage.setItem('invly_token', data.token);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const data = await memoriesApi.login(email, password);
    localStorage.setItem('invly_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('invly_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
  return ctx;
}
