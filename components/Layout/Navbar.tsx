'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Menu,
  X,
  User,
  Shield,
  FileText,
  Briefcase,
  Calendar,
  AlertTriangle,
  Clock,
  ExternalLink,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { getStoredData } from '../../lib/crm-store';
import { INITIAL_NOTIFICATIONS } from '../../lib/crm-initial-data';

export default function Navbar() {
  const { user, logout, switchUserRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newRecordOpen, setNewRecordOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState<any[]>(() => getStoredData('vibe_notifications', INITIAL_NOTIFICATIONS));

  const newRecordRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (newRecordRef.current && !newRecordRef.current.contains(e.target as Node)) {
        setNewRecordOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search-input') as HTMLInputElement | null;
        input?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navCategories = [
    {
      title: '1. Comercial',
      items: [
        { href: '/', label: 'Visão Geral' },
        { href: '/prospeccao', label: 'Prospecção Outbound' },
        { href: '/pipeline', label: 'Pipeline Kanban' },
        { href: '/agenda', label: 'Agenda & Reuniões' },
      ],
    },
    {
      title: '2. Relacionamento',
      items: [
        { href: '/empresas', label: 'Empresas & Contatos' },
        { href: '/clientes', label: 'Clientes' },
        { href: '/propostas', label: 'Propostas Comerciais' },
      ],
    },
    {
      title: '3. Operação',
      items: [
        { href: '/projetos', label: 'Projetos & SLA' },
        { href: '/tarefas', label: 'Tarefas' },
        { href: '/entregas', label: 'Entregas & Aprovações' },
      ],
    },
    {
      title: '4. Gestão',
      items: [
        { href: '/contratos', label: 'Contratos & MRR' },
        { href: '/conformidade', label: 'Conformidade' },
        { href: '/relatorios', label: 'Relatórios' },
        { href: '/configuracoes', label: 'Configurações' },
      ],
    },
  ];

  return (
    <header className="h-16 bg-surface/90 backdrop-blur-md border-b border-border-subtle px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-40">
      {/* Search Bar (Ctrl + K) */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-text-disabled absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                router.push(`/empresas?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            placeholder="Buscar empresas, leads, propostas ou projetos... (Ctrl + K)"
            className="w-full bg-surface-elevated border border-border-subtle rounded-lg pl-9 pr-14 py-2 text-xs text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary transition-colors"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[9px] bg-surface-container-highest border border-border-subtle text-text-disabled rounded font-mono font-medium">
              Ctrl
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[9px] bg-surface-container-highest border border-border-subtle text-text-disabled rounded font-mono font-medium">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* + Novo Registro Dropdown */}
        <div className="relative" ref={newRecordRef}>
          <button
            onClick={() => setNewRecordOpen(!newRecordOpen)}
            className="h-9 px-3.5 bg-primary hover:bg-cyan-300 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 text-xs transition-all shadow-sm shadow-cyan-500/10 cursor-pointer"
            type="button"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Novo Registro</span>
            <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </button>

          {newRecordOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-border-subtle rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-disabled font-semibold border-b border-border-subtle mb-1">
                Ações Rápidas
              </div>
              <Link
                href="/prospeccao"
                onClick={() => setNewRecordOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-primary hover:bg-surface-container-high transition-colors"
              >
                <span className="w-6 h-6 rounded-md bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 flex items-center justify-center font-bold text-xs">
                  +L
                </span>
                <div>
                  <div className="font-semibold">Novo Lead Outbound</div>
                  <div className="text-[10px] text-text-secondary">Qualificar empresa de Manaus</div>
                </div>
              </Link>
              <Link
                href="/pipeline"
                onClick={() => setNewRecordOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-primary hover:bg-surface-container-high transition-colors"
              >
                <span className="w-6 h-6 rounded-md bg-amber-950/60 text-amber-400 border border-amber-800/40 flex items-center justify-center font-bold text-xs">
                  +O
                </span>
                <div>
                  <div className="font-semibold">Nova Oportunidade</div>
                  <div className="text-[10px] text-text-secondary">Adicionar ao Pipeline Kanban</div>
                </div>
              </Link>
              <Link
                href="/agenda"
                onClick={() => setNewRecordOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-primary hover:bg-surface-container-high transition-colors"
              >
                <span className="w-6 h-6 rounded-md bg-purple-950/60 text-purple-400 border border-purple-800/40 flex items-center justify-center font-bold text-xs">
                  +A
                </span>
                <div>
                  <div className="font-semibold">Agendar Análise</div>
                  <div className="text-[10px] text-text-secondary">Diagnóstico Presença Própria</div>
                </div>
              </Link>
              <Link
                href="/propostas"
                onClick={() => setNewRecordOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-primary hover:bg-surface-container-high transition-colors"
              >
                <span className="w-6 h-6 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center justify-center font-bold text-xs">
                  +P
                </span>
                <div>
                  <div className="font-semibold">Criar Proposta</div>
                  <div className="text-[10px] text-text-secondary">Gerar PDF & condições comerciais</div>
                </div>
              </Link>
              <Link
                href="/projetos"
                onClick={() => setNewRecordOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-primary hover:bg-surface-container-high transition-colors"
              >
                <span className="w-6 h-6 rounded-md bg-blue-950/60 text-blue-400 border border-blue-800/40 flex items-center justify-center font-bold text-xs">
                  +S
                </span>
                <div>
                  <div className="font-semibold">Novo Projeto (SLA 7d)</div>
                  <div className="text-[10px] text-text-secondary">Kick-off de entrega</div>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border-subtle hidden sm:block"></div>

        {/* Notifications Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
            type="button"
            title="Notificações operacionais"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger font-mono text-[10px] font-bold text-text-primary leading-none ring-2 ring-surface">
                {notifications.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-elevated border border-border-subtle rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${notifications.length > 0 ? 'bg-danger animate-ping' : 'bg-success'}`}></span>
                  <span className="font-semibold text-xs text-text-primary">
                    Avisos Operacionais ({notifications.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-disabled">Hoje</span>
              </div>
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-xs text-text-secondary">
                  <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary opacity-60" />
                  <p className="font-medium text-text-primary">Tudo em dia!</p>
                  <p className="text-[11px] text-text-disabled mt-0.5">Nenhuma notificação crítica no momento.</p>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {notifications.map((n: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-surface rounded-lg border border-border-subtle flex gap-2.5 items-start">
                      <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-text-primary">{n.title || n.message}</div>
                        <p className="text-[11px] text-text-secondary mt-0.5">{n.description || n.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-1 py-1 rounded-lg hover:bg-surface-elevated transition-colors text-left cursor-pointer"
            type="button"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-border-subtle flex items-center justify-center font-mono text-xs font-bold text-primary ring-2 ring-primary/20">
                {user?.name?.split(' ').map((n) => n[0]).join('') || 'DL'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-surface"></span>
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-text-primary leading-tight">
                {user?.name || 'Daniel Leite'}
              </div>
              <div className="text-[10px] font-mono text-text-secondary leading-tight mt-0.5">
                {user?.role || 'CTO & Product'} • Manaus, AM
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-disabled hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-elevated border border-border-subtle rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-border-subtle mb-1">
                <div className="font-bold text-text-primary">{user?.name || 'Daniel Leite'}</div>
                <div className="text-[11px] text-primary font-mono">{user?.role || 'CTO & Product'}</div>
                <div className="text-[10px] text-text-disabled mt-0.5">VIBE Design Tech • Manaus/AM</div>
              </div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-disabled font-semibold">
                Alternar Perfil Fundador
              </div>
              <button
                onClick={() => {
                  switchUserRole('ADMINISTRADOR');
                  setProfileOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  user?.name.includes('Daniel') ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-container-high'
                }`}
              >
                <span>Daniel Leite (CTO)</span>
                {user?.name.includes('Daniel') && <span className="text-[10px] bg-primary text-slate-950 px-1 rounded font-bold">Ativo</span>}
              </button>
              <button
                onClick={() => {
                  switchUserRole('GESTOR_COMERCIAL');
                  setProfileOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  user?.name.includes('Victor') ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-container-high'
                }`}
              >
                <span>Victor Belichar (CEO)</span>
                {user?.name.includes('Victor') && <span className="text-[10px] bg-primary text-slate-950 px-1 rounded font-bold">Ativo</span>}
              </button>
              <div className="border-t border-border-subtle mt-1.5 pt-1.5">
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-danger hover:bg-danger/10 flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair do VIBE OS</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-text-secondary hover:text-text-primary lg:hidden rounded-lg"
          type="button"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-sidebar border-b border-border-subtle p-4 space-y-4 lg:hidden shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
          {navCategories.map((cat) => (
            <div key={cat.title}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-disabled font-semibold mb-1 px-2">
                {cat.title}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {cat.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-surface-elevated text-primary font-bold border-l-2 border-primary'
                        : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
