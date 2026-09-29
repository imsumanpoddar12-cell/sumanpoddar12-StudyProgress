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
  register: (studentData: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    branch?: string;
    course?: string;
    semester?: number;
    avatar?: string;
  }) => Promise<void>;
  updateProfile: (data: {
    avatar?: string;
    name?: string;
    phone?: string;
    branch?: string;
    semester?: number;
  }) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: Role, studentId?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const DEFAULT_STUDENT: User = {
  id: 'usr_stu_1',
  studentId: 'STU2024001',
  name: 'Alex Turner',
  email: 'alex.turner@college.edu',
  role: 'student',
  course: 'Bachelor of Technology (B.Tech)',
  branch: 'Computer Science & Engineering',
  semester: 4,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  isActive: true,
  phone: '+1 (555) 234-5678',
  enrollmentYear: 2023,
  createdAt: '2024-01-10T10:00:00Z',
  isPublicOnLeaderboard: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = authStorage.getUser();
    return saved || DEFAULT_STUDENT;
  });
  const [token, setToken] = useState<string | null>(() => {
    const saved = authStorage.getToken();
    return saved || 'usr_stu_1';
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      return;
    }
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
        authStorage.setUser(res.user);
      }
    } catch {
      // If token expired or offline, keep current user
    }
  };

  useEffect(() => {
    // If we have a saved token, verify it
    if (authStorage.getToken()) {
      refreshUser();
    }
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

  const register = async (studentData: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    branch?: string;
    course?: string;
    semester?: number;
    avatar?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.register(studentData);
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: {
    avatar?: string;
    name?: string;
    phone?: string;
    branch?: string;
    semester?: number;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.updateProfile(data);
      if (res && res.user) {
        setUser(res.user);
        authStorage.setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (targetRole: Role, studentId: string = 'STU2024001') => {
    setIsLoading(true);
    try {
      if (targetRole === 'admin') {
        const res = await api.login({ identifier: 'suman12', password: 'a@12', role: 'admin' });
        authStorage.setToken(res.token);
        authStorage.setUser(res.user);
        setToken(res.token);
        setUser(res.user);
        return;
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
    // Revert to direct-open default student experience
    setToken('usr_stu_1');
    setUser(DEFAULT_STUDENT);
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
        register,
        updateProfile,
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
