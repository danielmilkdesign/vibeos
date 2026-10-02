'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/crm';

export const DEMO_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Daniel Leite (CTO - Tecnologia & Produto)',
    email: 'daniel@vibe.tech',
    role: 'ADMINISTRADOR',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    active: true
  },
  {
    id: 'usr-ceo',
    name: 'Victor Belichar (CEO - Comercial & Relacionamento)',
    email: 'victor@vibe.tech',
    role: 'GESTOR_COMERCIAL',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    active: true
  },
  {
    id: 'usr-sdr',
    name: 'Time Outbound SDR (Comercial)',
    email: 'comercial@vibe.tech',
    role: 'COMERCIAL',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    active: true
  },
  {
    id: 'usr-ops',
    name: 'Fernanda Rocha (Head Operações)',
    email: 'operacoes@vibe.tech',
    role: 'OPERACOES',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    active: true
  },
  {
    id: 'usr-fin',
    name: 'Mariana Lima (Financeiro)',
    email: 'financeiro@vibe.tech',
    role: 'FINANCEIRO',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    active: true
  }
];

interface AuthContextType {
  user: User | null;
  login: (email: string, role?: UserRole) => boolean;
  switchUserRole: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('vibe_os_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(DEMO_USERS[0]);
      }
    } else {
      // Default initial user for seamless testing
      setUser(DEMO_USERS[0]);
    }
    setLoading(false);
  }, []);

  const login = (email: string, selectedRole?: UserRole) => {
    const found = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      const activeUser = selectedRole ? { ...found, role: selectedRole } : found;
      setUser(activeUser);
      localStorage.setItem('vibe_os_user', JSON.stringify(activeUser));
      return true;
    }
    
    // Allow custom login for demo
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role: selectedRole || 'COMERCIAL',
      active: true
    };
    setUser(newUser);
    localStorage.setItem('vibe_os_user', JSON.stringify(newUser));
    return true;
  };

  const switchUserRole = (role: UserRole) => {
    if (!user) return;
    const targetUser = DEMO_USERS.find(u => u.role === role) || { ...user, role };
    setUser(targetUser);
    localStorage.setItem('vibe_os_user', JSON.stringify(targetUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vibe_os_user');
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === 'ADMINISTRADOR') return true;
    return roles.includes(user.role);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
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
