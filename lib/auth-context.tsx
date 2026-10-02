'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/crm';
import {
  AuthorizedCredential,
  MagicAccessKey,
  FOUNDER_MAGIC_KEYS,
  AUTHORIZED_USERS,
  DEMO_USERS
} from './auth-constants';

export type { AuthorizedCredential, MagicAccessKey };
export { FOUNDER_MAGIC_KEYS, AUTHORIZED_USERS, DEMO_USERS };

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => AuthResult;
  loginWithMagicToken: (token: string, rememberMe?: boolean) => AuthResult;
  switchUserRole: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function setAuthCookie(token: string, remember: boolean) {
  if (typeof document === 'undefined') return;
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day
  document.cookie = `vibe_auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'vibe_auth_token=; path=/; max-age=0; SameSite=Lax';
}

export function hasAuthCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith('vibe_auth_token='));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('vibe_os_user');
      const token = localStorage.getItem('vibe_auth_token');
      
      if (savedUserStr && (token || hasAuthCookie())) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.email) {
          setUser(parsed);
          if (token && !hasAuthCookie()) {
            setAuthCookie(token, true);
          }
        } else {
          setUser(null);
          clearAuthCookie();
        }
      } else {
        // STRICT SECURITY: Do not auto-login without credentials
        setUser(null);
        clearAuthCookie();
      }
    } catch {
      setUser(null);
      clearAuthCookie();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string, password = '', rememberMe = true): AuthResult => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      return { success: false, error: 'Por favor, informe seu e-mail corporativo.' };
    }

    const masterPassword = process.env.NEXT_PUBLIC_VIBE_PASSWORD || 'vibe2026';

    const match = AUTHORIZED_USERS.find(
      u => u.email.toLowerCase() === cleanEmail
    );

    const isPasswordValid =
      cleanPassword === masterPassword ||
      (match && match.passwords.includes(cleanPassword));

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Senha incorreta. Verifique suas credenciais corporativas.'
      };
    }

    const authenticatedUser: User = match
      ? {
          id: `usr-${match.role.toLowerCase()}`,
          name: match.name,
          email: match.email,
          role: match.role,
          avatarUrl: match.avatarUrl,
          active: true
        }
      : {
          id: `usr-${Date.now()}`,
          name: cleanEmail.split('@')[0].toUpperCase(),
          email: cleanEmail,
          role: cleanEmail.includes('victor') ? 'GESTOR_COMERCIAL' : 'ADMINISTRADOR',
          active: true
        };

    const token = `vibe_sess_${Date.now()}_${btoa(cleanEmail).substring(0, 16)}`;

    setUser(authenticatedUser);
    localStorage.setItem('vibe_os_user', JSON.stringify(authenticatedUser));
    localStorage.setItem('vibe_auth_token', token);
    setAuthCookie(token, rememberMe);

    return { success: true };
  };

  const loginWithMagicToken = (token: string, rememberMe = true): AuthResult => {
    const key = token.trim();
    const match = FOUNDER_MAGIC_KEYS[key];

    if (!match) {
      return {
        success: false,
        error: 'Chave de acesso inválida ou expirada. Este link é restrito aos fundadores.'
      };
    }

    const authenticatedUser: User = {
      id: `usr-${match.role.toLowerCase()}`,
      name: match.name,
      email: match.email,
      role: match.role,
      avatarUrl: match.avatarUrl,
      active: true
    };

    const sessionToken = `vibe_sess_${Date.now()}_${btoa(match.email).substring(0, 16)}`;

    setUser(authenticatedUser);
    localStorage.setItem('vibe_os_user', JSON.stringify(authenticatedUser));
    localStorage.setItem('vibe_auth_token', sessionToken);
    setAuthCookie(sessionToken, rememberMe);

    return { success: true };
  };

  const switchUserRole = (role: UserRole) => {
    if (!user) return;
    const targetUser = DEMO_USERS.find(u => u.role === role) || { ...user, role };
    setUser(targetUser);
    localStorage.setItem('vibe_os_user', JSON.stringify(targetUser));
  };

  const logout = () => {
    setUser(null);
    clearAuthCookie();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vibe_os_user');
      localStorage.removeItem('vibe_auth_token');
      window.location.href = '/login';
    }
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === 'ADMINISTRADOR') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithMagicToken,
        switchUserRole,
        logout,
        isAuthenticated: !!user,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
