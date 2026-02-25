import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { GymProfile } from '@/api/types';
import { getToken, removeToken, saveToken } from '@/api/client';
import { getGymDetailAPI } from '@/api/gym';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  gym: GymProfile | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshGym: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [gym, setGym] = useState<GymProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGym = useCallback(async () => {
    try {
      const res = await getGymDetailAPI();
      setGym(res.data);
    } catch {
      removeToken();
      setGym(null);
    }
  }, []);

  const login = useCallback(
    async (token: string) => {
      saveToken(token);
      await fetchGym();
    },
    [fetchGym],
  );

  const logout = useCallback(() => {
    removeToken();
    setGym(null);
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchGym().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchGym]);

  const value = useMemo(
    () => ({
      isAuthenticated: !!gym,
      isLoading,
      gym,
      login,
      logout,
      refreshGym: fetchGym,
    }),
    [gym, isLoading, login, logout, fetchGym],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
