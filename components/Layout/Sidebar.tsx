'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Building2,
  Kanban,
  Calendar,
  FileText,
  Layers,
  FileCheck,
  ShieldCheck,
  Settings,
  Sparkles,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, switchUserRole } = useAuth();

  const navItems = [
    { href: '/', label: 'Dashboard 360°', icon: TrendingUp },
    { href: '/leads', label: 'Prospecção Outbound', icon: Building2 },
    { href: '/pipeline', label: 'Pipeline Commercial', icon: Kanban },
    { href: '/agenda', label: 'Agenda & Análise 20m', icon: Calendar },
    { href: '/propostas', label: 'Propostas Comerciais', icon: FileText },
    { href: '/projetos', label: 'Esteira de Projetos', icon: Layers },
    { href: '/contratos', label: 'Contratos & Recorrência', icon: FileCheck },
    { href: '/conformidade', label: 'Normas & Conformidade', icon: ShieldCheck },
    { href: '/configuracoes', label: 'Configurações & Equipe', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hidden lg:flex select-none">
      <div>
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            V
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              VIBE OS
            </h1>
            <p className="text-[11px] text-cyan-400 font-semibold tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> CRM Commercial v2.0
            </p>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="space-y-1 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 text-cyan-300 border border-cyan-800/60 shadow-md shadow-cyan-950/50'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session & Role Quick Switcher */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        {user ? (
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 truncate">
                <p className="font-semibold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> {user.role}
                </p>
              </div>
            </div>

            {/* Quick Role Switcher for Testing */}
            <div className="pt-2 border-t border-slate-900 space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Simular Perfil:</p>
              <select
                value={user.role}
                onChange={(e) => switchUserRole(e.target.value as any)}
                className="w-full bg-slate-900 text-slate-300 border border-slate-700 text-[11px] rounded px-2 py-1 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="GESTOR_COMERCIAL">Gestor Comercial</option>
                <option value="COMERCIAL">Comercial / SDR</option>
                <option value="OPERACOES">Operações / PM</option>
                <option value="DESIGN_CONTEUDO">Design / Conteúdo</option>
                <option value="FINANCEIRO">Financeiro</option>
              </select>
            </div>

            <button
              onClick={logout}
              className="w-full mt-2 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-[11px] rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3 h-3" /> Sair do Sistema
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl text-center block shadow-lg shadow-cyan-600/20"
          >
            Fazer Login
          </Link>
        )}
      </div>
    </aside>
  );
}
