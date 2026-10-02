'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Grid,
  Send,
  Kanban,
  Calendar,
  Building2,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  PackageCheck,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Settings,
  HelpCircle,
  Sparkles,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, switchUserRole } = useAuth();

  const menuGroups = [
    {
      title: '1. Comercial',
      items: [
        { href: '/', label: 'Visão Geral', icon: Grid },
        { href: '/prospeccao', label: 'Prospecção Outbound', icon: Send },
        { href: '/pipeline', label: 'Pipeline Kanban', icon: Kanban },
        { href: '/agenda', label: 'Agenda & Reuniões', icon: Calendar },
      ]
    },
    {
      title: '2. Relacionamento',
      items: [
        { href: '/empresas', label: 'Empresas & Contatos', icon: Building2 },
        { href: '/clientes', label: 'Clientes', icon: Users },
        { href: '/propostas', label: 'Propostas Comerciais', icon: FileText },
      ]
    },
    {
      title: '3. Operação',
      items: [
        { href: '/projetos', label: 'Projetos & SLA', icon: Clock },
        { href: '/tarefas', label: 'Tarefas', icon: CheckCircle2 },
        { href: '/entregas', label: 'Entregas & Aprovações', icon: PackageCheck },
      ]
    },
    {
      title: '4. Gestão',
      items: [
        { href: '/contratos', label: 'Contratos & MRR', icon: TrendingUp },
        { href: '/conformidade', label: 'Conformidade', icon: ShieldCheck },
        { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
        { href: '/configuracoes', label: 'Configurações', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-[248px] bg-sidebar border-r border-border-subtle z-50 flex flex-col justify-between select-none h-screen sticky top-0 overflow-y-auto shrink-0 hidden lg:flex">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-border-subtle">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-cyan-500/20">
            V
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-text-primary tracking-tight leading-none">
              VIBE OS
            </span>
            <span className="font-mono text-[10px] text-text-disabled uppercase mt-0.5 tracking-wider font-semibold">
              Design Tech
            </span>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex flex-col py-3">
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-2">
              <div className="px-4 py-1.5 text-[11px] font-mono uppercase tracking-wider text-text-disabled font-semibold">
                {group.title}
              </div>
              <div className="space-y-0.5 px-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href === '/prospeccao' && pathname === '/leads');

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-surface-elevated text-primary border-l-2 border-primary font-semibold shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-elevated hover:text-on-surface'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-text-secondary'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border-subtle bg-surface-container-lowest/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span className="font-mono text-[11px] text-text-secondary">VIBE v2.4 SaaS</span>
        </div>
        <button
          onClick={logout}
          title="Sair / Trocar perfil"
          className="text-text-disabled hover:text-text-primary transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
