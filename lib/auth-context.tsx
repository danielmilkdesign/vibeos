'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/crm';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthorizedCredential {
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  passwords: string[];
}

export const AUTHORIZED_USERS: AuthorizedCredential[] = [
  {
    email: 'daniel@vibedesign.com.br',
    name: 'Daniel Leite (CTO & Head de Design/Tech)',
    role: 'ADMINISTRADOR',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    passwords: ['vibe2026@admin', 'vibe2026', 'admin2026']
  },
  {
    email: 'daniel@vibe.tech',
    name: 'Daniel Leite (CTO & Head de Design/Tech)',
    role: 'ADMINISTRADOR',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    passwords: ['vibe2026@admin', 'vibe2026', 'admin2026']
  },
  {
    email: 'victor@vibedesign.com.br',
    name: 'Victor Belichar (CEO & Gestor Comercial)',
    role: 'GESTOR_COMERCIAL',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    passwords: ['vibe2026@comercial', 'vibe2026', 'vibecomercial']
  },
  {
    email: 'victor@vibe.tech',
    name: 'Victor Belichar (CEO & Gestor Comercial)',
    role: 'GESTOR_COMERCIAL',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    passwords: ['vibe2026@comercial', 'vibe2026', 'vibecomercial']
  },
  {
    email: 'comercial@vibe.tech',
    name: 'Time Outbound SDR (Comercial)',
    role: 'COMERCIAL',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    passwords: ['vibe2026']
  },
  {
    email: 'operacoes@vibe.tech',
    name: 'Fernanda Rocha (Head Operações)',
    role: 'OPERACOES',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    passwords: ['vibe2026']
  }
];

export const DEMO_USERS: User[] = AUTHORIZED_USERS.map((u, i) => ({
  id: `usr-${i + 1}`,
  name: u.name,
  email: u.email,
  role: u.role,
  avatarUrl: u.avatarUrl,
  active: true
}));

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => AuthResult;
  switchUserRole: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setAuthCookie(token: string, remember: boolean) {
  if (typeof document === 'undefined') return;
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day
  document.cookie = `vibe_auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'vibe_auth_token=; path=/; max-age=0; SameSite=Lax';
}

function hasAuthCookie(): boolean {
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
          // Ensure cookie is in sync with localStorage
          if (token && !hasAuthCookie()) {
            setAuthCookie(token, true);
          }
        } else {
          setUser(null);
          clearAuthCookie();
        }
      } else {
        // STRICT SECURITY: Do not auto-login anyone without credentials!
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

    // Master password override for emergency founder access
    const masterPassword = process.env.NEXT_PUBLIC_VIBE_PASSWORD || 'vibe2026';

    const match = AUTHORIZED_USERS.find(
      u => u.email.toLowerCase() === cleanEmail
    );

    // Validate password
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
