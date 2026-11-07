import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, tokenStore } from '@/lib/api/client';
import type { AuthUser, RegisterPayload } from '@/lib/api/types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  socialLogin: (provider: string, accessToken: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  setSession: (access: string, refresh: string, user?: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = (): AuthUser | null => {
  try {
    const raw = window.localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed && parsed.id && parsed.email ? parsed : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredUser();
    if (stored && tokenStore.access) setUser(stored);
    setIsLoading(false);
  }, []);

  const setSession = useCallback((access: string, refresh: string, nextUser?: AuthUser) => {
    tokenStore.set(access, refresh);
    if (nextUser) {
      setUser(nextUser);
      window.localStorage.setItem('user', JSON.stringify(nextUser));
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login(email, password);
      if (!data?.access || !data?.refresh) throw new Error('Sign-in failed. Please try again.');
      setSession(data.access, data.refresh, data.user);
    },
    [setSession],
  );

  const socialLogin = useCallback(
    async (provider: string, accessToken: string) => {
      const data = await authApi.social(provider, accessToken);
      if (!data?.access || !data?.refresh) throw new Error('Sign-in failed. Please try again.');
      setSession(data.access, data.refresh, data.user);
    },
    [setSession],
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    await authApi.register(payload);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), isLoading, login, socialLogin, register, setSession, logout }),
    [user, isLoading, login, socialLogin, register, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
