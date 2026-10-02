import { User, UserRole } from '../types/crm';

export interface AuthorizedCredential {
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  passwords: string[];
}

export interface MagicAccessKey {
  token: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
}

export const FOUNDER_MAGIC_KEYS: Record<string, MagicAccessKey> = {
  // Daniel Leite (CTO)
  vibe_sec_danielleite_c9a87d10e54b: {
    token: 'vibe_sec_danielleite_c9a87d10e54b',
    email: 'danielleitedesign@gmail.com',
    name: 'Daniel Leite (CTO & Head de Design/Tech)',
    role: 'ADMINISTRADOR',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  daniel: {
    token: 'vibe_sec_danielleite_c9a87d10e54b',
    email: 'danielleitedesign@gmail.com',
    name: 'Daniel Leite (CTO & Head de Design/Tech)',
    role: 'ADMINISTRADOR',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  danielleite: {
    token: 'vibe_sec_danielleite_c9a87d10e54b',
    email: 'danielleitedesign@gmail.com',
    name: 'Daniel Leite (CTO & Head de Design/Tech)',
    role: 'ADMINISTRADOR',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  // Victor Belichar (CEO)
  vibe_sec_victorbelichar_f4b72e91d83a: {
    token: 'vibe_sec_victorbelichar_f4b72e91d83a',
    email: 'victorbelichar@gmail.com',
    name: 'Victor Belichar (CEO & Gestor Comercial)',
    role: 'GESTOR_COMERCIAL',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  victor: {
    token: 'vibe_sec_victorbelichar_f4b72e91d83a',
    email: 'victorbelichar@gmail.com',
    name: 'Victor Belichar (CEO & Gestor Comercial)',
    role: 'GESTOR_COMERCIAL',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  victorbelichar: {
    token: 'vibe_sec_victorbelichar_f4b72e91d83a',
    email: 'victorbelichar@gmail.com',
    name: 'Victor Belichar (CEO & Gestor Comercial)',
    role: 'GESTOR_COMERCIAL',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  }
};

export const AUTHORIZED_USERS: AuthorizedCredential[] = [
  // Daniel Leite - Fundador CTO
  {
    email: 'danielleitedesign@gmail.com',
    name: 'Daniel Leite (CTO & Head de Design/Tech)',
    role: 'ADMINISTRADOR',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    passwords: ['vibe2026', 'vibe2026@admin', 'admin2026']
  },
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
  // Victor Belichar - Fundador CEO
  {
    email: 'victorbelichar@gmail.com',
    name: 'Victor Belichar (CEO & Gestor Comercial)',
    role: 'GESTOR_COMERCIAL',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    passwords: ['vibe2026', 'vibe2026@comercial', 'vibecomercial']
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
  // Equipe Interna
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
