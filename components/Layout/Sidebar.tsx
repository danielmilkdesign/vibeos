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
  LogOut
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuGroups = [
    {
      title: 'Comercial',
      items: [
        { href: '/', label: 'Visão Geral', icon: Grid },
        { href: '/prospeccao', label: 'Prospecção', icon: Send },
        { href: '/pipeline', label: 'Pipeline', icon: Kanban },
        { href: '/agenda', label: 'Agenda & Reuniões', icon: Calendar },
      ]
    },
    {
      title: 'Relacionamento',
      items: [
        { href: '/empresas', label: 'Empresas & Contatos', icon: Building2 },
        { href: '/clientes', label: 'Clientes', icon: Users },
        { href: '/propostas', label: 'Propostas', icon: FileText },
      ]
    },
    {
      title: 'Operação',
      items: [
        { href: '/projetos', label: 'Projetos', icon: Clock },
        { href: '/tarefas', label: 'Tarefas', icon: CheckCircle2 },
        { href: '/entregas', label: 'Entregas', icon: PackageCheck },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { href: '/contratos', label: 'Contratos & MRR', icon: TrendingUp },
        { href: '/conformidade', label: 'Conformidade', icon: ShieldCheck },
        { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
        { href: '/configuracoes', label: 'Configurações', icon: Settings },
      ]
    }
  ];

  const userName = user?.name || 'Daniel Leite';
  const userInitials = userName.split(' ').map((n) => n[0]).slice(0, 2).join('');

  return (
    <aside className="w-60 bg-[#090D16] border-r border-white/[0.06] z-50 flex flex-col justify-between select-none h-screen sticky top-0 shrink-0 hidden lg:flex">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-white/[0.06]" title="O sistema operacional e comercial da VIBE Design Tech">
          <div className="w-7 h-7 rounded-md bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xs tracking-tight">
            V
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-white tracking-tight">
              VIBE OS
            </span>
            <span className="text-[10px] text-slate-400 leading-none">
              Design Tech
            </span>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href === '/prospeccao' && pathname === '/leads');

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        isActive
                          ? 'bg-white/[0.06] text-white font-medium'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer: User profile and logout */}
      <div className="p-3 border-t border-white/[0.06] bg-[#070B12] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-200 flex items-center justify-center text-[11px] font-medium shrink-0">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-slate-200 font-medium truncate leading-tight">
              {userName}
            </span>
            <span className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
              {user?.role || 'Admin'}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          title="Encerrar sessão"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
