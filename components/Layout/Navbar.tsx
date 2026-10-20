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
  AlertCircle,
  Clock,
  LogOut,
  Send,
  Zap,
  PackageCheck
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
      title: 'Comercial',
      items: [
        { href: '/', label: 'Visão Geral' },
        { href: '/prospeccao', label: 'Prospecção' },
        { href: '/pipeline', label: 'Pipeline' },
        { href: '/agenda', label: 'Agenda & Reuniões' },
      ],
    },
    {
      title: 'Relacionamento',
      items: [
        { href: '/empresas', label: 'Empresas & Contatos' },
        { href: '/clientes', label: 'Clientes' },
        { href: '/propostas', label: 'Propostas' },
      ],
    },
    {
      title: 'Operação',
      items: [
        { href: '/projetos', label: 'Projetos' },
        { href: '/tarefas', label: 'Tarefas' },
        { href: '/entregas', label: 'Entregas' },
      ],
    },
    {
      title: 'Gestão',
      items: [
        { href: '/contratos', label: 'Contratos & MRR' },
        { href: '/conformidade', label: 'Conformidade' },
        { href: '/relatorios', label: 'Relatórios' },
        { href: '/configuracoes', label: 'Configurações' },
      ],
    },
  ];

  const userName = user?.name || 'Daniel Leite';
  const userInitials = userName.split(' ').map((n) => n[0]).slice(0, 2).join('');

  return (
    <header className="h-14 bg-[#090D16]/90 backdrop-blur-md border-b border-white/[0.06] px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-40">
      {/* Search Bar (Ctrl + K) */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
            placeholder="Buscar empresas, leads ou projetos... (Ctrl + K)"
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-8 pr-12 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/[0.15] transition-colors"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] bg-white/[0.04] border border-white/[0.06] text-slate-500 rounded font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* + Novo Registro Dropdown */}
        <div className="relative" ref={newRecordRef}>
          <button
            onClick={() => setNewRecordOpen(!newRecordOpen)}
            className="h-8 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            type="button"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Criar</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {newRecordOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#0E1422] border border-white/[0.08] rounded-xl shadow-xl p-1.5 z-50 text-xs">
              <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                Novo Registro
              </div>
              <Link
                href="/prospeccao"
                onClick={() => setNewRecordOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-slate-400" />
                <span>Lead Outbound</span>
              </Link>
              <Link
                href="/pipeline"
                onClick={() => setNewRecordOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                <span>Oportunidade</span>
              </Link>
              <Link
                href="/agenda"
                onClick={() => setNewRecordOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Reunião / Análise</span>
              </Link>
              <Link
                href="/propostas"
                onClick={() => setNewRecordOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Proposta Comercial</span>
              </Link>
              <Link
                href="/projetos"
                onClick={() => setNewRecordOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <PackageCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Projeto</span>
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer relative"
            type="button"
            title="Notificações"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0E1422] border border-white/[0.08] rounded-xl shadow-xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                <span className="font-semibold text-white">Notificações</span>
                <span className="text-[10px] text-slate-500">{notifications.length} avisos</span>
              </div>
              {notifications.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                  Nenhuma notificação no momento.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((n: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex gap-2 items-start">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-white">{n.title || n.message}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.description || n.detail}</p>
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
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
            type="button"
          >
            <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-medium text-slate-200">
              {userInitials}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0E1422] border border-white/[0.08] rounded-xl shadow-xl p-2 z-50 text-xs">
              <div className="px-2.5 py-2 border-b border-white/[0.06] mb-1">
                <div className="font-medium text-white">{userName}</div>
                <div className="text-[11px] text-slate-400">{user?.role || 'Admin'}</div>
              </div>
              <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                Alternar Perfil
              </div>
              <button
                onClick={() => {
                  switchUserRole('ADMINISTRADOR');
                  setProfileOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  user?.name.includes('Daniel') ? 'bg-white/[0.06] text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <span>Daniel Leite (CTO)</span>
              </button>
              <button
                onClick={() => {
                  switchUserRole('GESTOR_COMERCIAL');
                  setProfileOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  user?.name.includes('Victor') ? 'bg-white/[0.06] text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <span>Victor Belichar (CEO)</span>
              </button>
              <div className="border-t border-white/[0.06] mt-1.5 pt-1.5">
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-400 hover:text-white lg:hidden rounded-lg"
          type="button"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 w-full bg-[#090D16] border-b border-white/[0.08] p-4 space-y-4 lg:hidden shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
          {navCategories.map((cat) => (
            <div key={cat.title}>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1.5 px-2">
                {cat.title}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {cat.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      pathname === item.href
                        ? 'bg-white/[0.06] text-white font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
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
