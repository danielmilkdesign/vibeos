'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Shield, Menu, X, PlusCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/leads', label: 'Leads Outbound' },
    { href: '/pipeline', label: 'Pipeline' },
    { href: '/agenda', label: 'Agenda' },
    { href: '/propostas', label: 'Propostas' },
    { href: '/projetos', label: 'Projetos' },
    { href: '/contratos', label: 'Contratos' },
    { href: '/conformidade', label: 'Conformidade' },
    { href: '/configuracoes', label: 'Configurações' }
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar empresa, decisor, proposta ou projeto..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-4">
        {/* System Health / SLA Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SLA 7 Dias: Operacional</span>
        </div>

        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5" />
        </button>

        {/* User Info / Auth */}
        {user ? (
          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-100">{user.name}</p>
              <p className="text-[10px] text-cyan-400 font-mono">{user.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs border border-cyan-400/40 shadow-sm">
              {user.name.charAt(0)}
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" /> Entrar
          </Link>
        )}

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-slate-200 lg:hidden rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 p-4 space-y-2 lg:hidden shadow-2xl z-50">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm ${
                pathname === item.href
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/50'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
