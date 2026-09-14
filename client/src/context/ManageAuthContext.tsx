import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { manageApi } from '../lib/manageApi';

interface ManageAuthValue {
  ready: boolean;
  authenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const ManageAuthContext = createContext<ManageAuthValue | null>(null);

export function ManageAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => { manageApi.session().then(() => setAuthenticated(true)).catch(() => setAuthenticated(false)).finally(() => setReady(true)); }, []);

  const login = async (username: string, password: string) => { await manageApi.login(username, password); setAuthenticated(true); };
  const logout = async () => { await manageApi.logout(); setAuthenticated(false); };
  return <ManageAuthContext.Provider value={{ ready, authenticated, login, logout }}>{children}</ManageAuthContext.Provider>;
}

export function useManageAuth() {
  const context = useContext(ManageAuthContext);
  if (!context) throw new Error('useManageAuth must be used inside ManageAuthProvider');
  return context;
}
