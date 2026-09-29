import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types/index.ts';
import { api, authStorage } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  login: (identifier: string, password: string, role?: Role) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: Role, studentId?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authStorage.getUser());
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('studyprogress_theme') || localStorage.getItem('study_boost_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('studyprogress_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const refreshUser = async () => {
    const curToken = authStorage.getToken();
    if (!curToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
      authStorage.setUser(res.user);
    } catch {
      // If token expired or invalid, keep cached or clear if 401
      // but if offline, keep cached user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, password: string, targetRole?: Role) => {
    setIsLoading(true);
    try {
      const res = await api.login({ identifier, password, role: targetRole });
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (targetRole: Role, studentId: string = 'STU2024001') => {
    setIsLoading(true);
    try {
      if (targetRole === 'admin') {
        throw new Error('Admin authentication requires administrative password verification.');
      }
      const identifier = studentId;
      const password = 'student123';
      const res = await api.login({ identifier, password, role: 'student' });
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        token,
        isLoading,
        theme,
        toggleTheme,
        login,
        logout,
        quickDemoLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
