import React, { createContext, useContext, useMemo, useState } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

interface AuthContextValue extends AuthState {
  login: (username: string) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'banking-auth-session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredAuth = (): AuthState => {
  const data = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!data) {
    return { isAuthenticated: false, username: null };
  }

  try {
    const parsed = JSON.parse(data) as AuthState;
    return parsed;
  } catch {
    return { isAuthenticated: false, username: null };
  }
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => getStoredAuth());

  const login = (username: string) => {
    const next = { isAuthenticated: true, username };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    setAuth(next);
  };

  const logout = () => {
    const next = { isAuthenticated: false, username: null };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    setAuth(next);
  };

  const value = useMemo(() => ({ ...auth, login, logout }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
