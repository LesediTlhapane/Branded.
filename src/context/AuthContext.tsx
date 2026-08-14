import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { AuthService } from '../services/AuthService';
import { Repository } from '../db/storage';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  requiresPasswordChange: boolean;
  login: (email: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  completePasswordChange: (newPassword: string) => { success: boolean; message: string };
  switchUserRole: (role: 'ADMIN' | 'STAFF' | 'PUBLIC_CUSTOMER') => void;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sa_quote_auth_user_v2';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string, pass: string) => {
    const result = AuthService.login(email, pass);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, message: result.message };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const completePasswordChange = (newPassword: string) => {
    if (!user) return { success: false, message: 'No active user session.' };
    const res = AuthService.completePasswordChange(user.id, newPassword);
    if (res.success && res.updatedUser) {
      setUser(res.updatedUser);
    }
    return res;
  };

  const refreshUsers = () => {
    if (user) {
      const latestUsers = Repository.getUsers();
      const updated = latestUsers.find(u => u.id === user.id);
      if (updated) setUser(updated);
    }
  };

  const switchUserRole = (target: 'ADMIN' | 'STAFF' | 'PUBLIC_CUSTOMER') => {
    const users = Repository.getUsers();
    if (target === 'ADMIN') {
      const admin = users.find(u => u.role === 'ADMIN');
      if (admin) setUser(admin);
    } else if (target === 'STAFF') {
      const staff = users.find(u => u.role === 'STAFF');
      if (staff) setUser(staff);
    } else {
      setUser(null); // Public Customer Mode
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        requiresPasswordChange: user ? user.requiresPasswordChange : false,
        login,
        logout,
        completePasswordChange,
        switchUserRole,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
