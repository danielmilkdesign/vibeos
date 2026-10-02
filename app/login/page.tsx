'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_USERS } from '../../lib/auth-context';
import { Lock, Mail, Shield, Sparkles, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types/crm';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMINISTRADOR');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, informe seu e-mail corporativo.');
      return;
    }
    const success = login(email, selectedRole);
    if (success) {
      router.push('/');
    } else {
      setError('Credenciais inválidas.');
    }
  };

  const handleQuickDemoLogin = (demoUser: typeof DEMO_USERS[0]) => {
    login(demoUser.email, demoUser.role);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white font-black text-2xl shadow-xl shadow-cyan-500/20 mb-3">
            V
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            VIBE OS CRM
          </h1>
          <p className="text-xs text-cyan-400 font-medium mt-1 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Sistema Operacional Comercial & Projetos
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail Corporativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome@vibe.tech"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Perfil / Nível de Permissão (Backend RBAC)
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ADMINISTRADOR">Administrador (Acesso Total)</option>
              <option value="GESTOR_COMERCIAL">Gestor Comercial (Pipeline & Relatórios)</option>
              <option value="COMERCIAL">Comercial / SDR (Leads & Propostas)</option>
              <option value="OPERACOES">Operações / PM (Projetos & Prazos)</option>
              <option value="DESIGN_CONTEUDO">Design & Conteúdo (Entregas)</option>
              <option value="FINANCEIRO">Financeiro (Contratos & MRR)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all mt-2"
          >
            <span>Entrar no VIBE OS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Preset Demo User Profiles for 1-click Testing */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Acesso Rápido por Perfil (Demo)
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => handleQuickDemoLogin(u)}
                className="w-full p-2.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-700/60 rounded-xl text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                      {u.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-mono">
                  {u.role.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
