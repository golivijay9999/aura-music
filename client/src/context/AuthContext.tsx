import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/music';
import { api } from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('aura_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch {
          // If token expired, initialize guest session
          initGuest();
        } finally {
          setIsLoading(false);
        }
      } else {
        initGuest();
      }
    }

    async function initGuest() {
      try {
        const res = await api.guestLogin();
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('aura_auth_token', res.token);
      } catch (e) {
        console.error('Guest init error:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (u: string, p: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(u, p);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('aura_auth_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (u: string, p: string, email?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(u, p, email);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('aura_auth_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const guestLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.guestLogin();
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('aura_auth_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('aura_auth_token');
    guestLogin();
  };

  const updateUser = async (updates: Partial<User>) => {
    const res = await api.updateProfile(updates);
    if (res.user) {
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, guestLogin, logout, updateUser }}>
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
