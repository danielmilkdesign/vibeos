'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  TrendingUp,
  Clock,
  Layers,
  UserCheck
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../lib/auth-context';

import { UserRole } from '../../types/crm';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('daniel@vibedesign.com.br');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, informe seu e-mail profissional.');
      return;
    }
    const isVictor = email.toLowerCase().includes('victor');
    const role: UserRole = isVictor ? 'GESTOR_COMERCIAL' : 'ADMINISTRADOR';
    login(email, role);
    router.push('/');
  };

  const handleQuickLogin = (demoEmail: string, roleName: UserRole) => {
    login(demoEmail, roleName);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-stretch bg-[#070B14] text-text-primary antialiased selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Left Column: Brand Presentation & Tech Concept (7/12) */}
      <div className="hidden lg:flex lg:w-7/12 relative flex-col justify-between p-12 lg:p-16 border-r border-border-subtle bg-[#070B14] overflow-hidden">
        {/* Grid and Ambient Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(30, 41, 59, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.35) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top of Left Column: Logo & Version */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-surface border border-primary/30 flex items-center justify-center font-black text-primary text-xl shadow-lg shadow-cyan-500/10">
              V
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                VIBE<span className="text-primary">OS</span>
              </span>
              <span className="ml-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-text-disabled px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle">
                CRM v2.4
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface/80 border border-border-subtle text-xs text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-mono text-[11px]">Manaus Studio Hub • Ativo</span>
          </div>
        </div>

        {/* Center: Narrative & Operational Pillars */}
        <div className="relative z-10 my-auto max-w-xl py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
            <Zap className="w-3.5 h-3.5" />
            VIBE Design Tech • Operações Unificadas
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight mb-5">
            O sistema operacional comercial e operacional da{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
              VIBE Design Tech.
            </span>
          </h1>

          <p className="text-base text-text-secondary font-normal leading-relaxed mb-10">
            Prospecção outbound, vendas consultivas, gestão de projetos com SLA contratual e esteiras de recorrência integradas em um único ecossistema analítico.
          </p>

          {/* Mini-panel with 4 Connected Pillars */}
          <div className="p-6 rounded-2xl bg-surface/90 border border-border-subtle backdrop-blur-md shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Fluxo de Ponta a Ponta Conectado
              </span>
              <span className="text-[11px] font-mono text-text-disabled">Sync em Tempo Real</span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
                <div className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">
                  01. Prospecção
                </div>
                <div className="text-xs font-semibold text-white">Outbound &amp; SEO</div>
                <div className="text-[10px] text-text-disabled mt-1">142 Alvos</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
                <div className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">
                  02. Pipeline
                </div>
                <div className="text-xs font-semibold text-white">Kanban &amp; Deals</div>
                <div className="text-[10px] text-text-disabled mt-1">R$ 10.779</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
                <div className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">
                  03. Operação
                </div>
                <div className="text-xs font-semibold text-white">Projetos &amp; SLA</div>
                <div className="text-[10px] text-success mt-1">94.2% no Prazo</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
                <div className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">
                  04. Gestão
                </div>
                <div className="text-xs font-semibold text-white">MRR &amp; Contratos</div>
                <div className="text-[10px] text-text-disabled mt-1">Planos de Artes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Credibility & Segments */}
        <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-text-disabled pt-6 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-secondary">Segmentos atendidos:</span>
            <span>Clínicas Médicas</span>
            <span>•</span>
            <span>Estética Avançada</span>
            <span>•</span>
            <span>Odontologia</span>
            <span>•</span>
            <span>Advocacia</span>
          </div>
          <div className="font-mono text-[11px] text-text-disabled">
            vibe-design-tech.vercel.app
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Card (5/12) */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#0A0E17] relative">
        {/* Mobile Header with Logo */}
        <div className="flex lg:hidden items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-surface border border-primary/40 flex items-center justify-center font-bold text-primary">
              V
            </div>
            <span className="text-lg font-extrabold text-white">
              VIBE<span className="text-primary">OS</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-primary px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle">
            CRM
          </span>
        </div>

        {/* Center: Cyber Card Login */}
        <div className="my-auto max-w-md w-full mx-auto">
          <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-border-subtle shadow-2xl shadow-cyan-950/20">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Entrar no VIBE OS
                </h2>
                <span className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <p className="text-xs text-text-secondary">
                Informe suas credenciais corporativas da equipe VIBE Design Tech.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/30 text-danger text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold mb-1.5">
                  E-mail Profissional
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="nome@vibedesign.com.br"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-xl text-text-primary text-xs focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                    Senha de Acesso
                  </label>
                  <span className="text-[11px] text-primary hover:underline cursor-pointer">
                    Esqueceu a senha?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-xl text-text-primary text-xs font-mono focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer"
              >
                <span>Acessar Painel VIBE OS</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Quick Login Chips for Founders */}
            <div className="mt-8 pt-6 border-t border-border-subtle">
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-disabled text-center mb-3">
                Acesso Rápido para Fundadores
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('daniel@vibedesign.com.br', 'ADMINISTRADOR')}
                  className="p-2.5 bg-surface-container-lowest hover:bg-surface-elevated border border-border-subtle rounded-xl text-left transition-colors cursor-pointer group"
                >
                  <div className="text-xs font-bold text-text-primary group-hover:text-primary">
                    Daniel Leite
                  </div>
                  <div className="text-[10px] text-primary font-mono">CTO Tech/Design</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('victor@vibedesign.com.br', 'GESTOR_COMERCIAL')}
                  className="p-2.5 bg-surface-container-lowest hover:bg-surface-elevated border border-border-subtle rounded-xl text-left transition-colors cursor-pointer group"
                >
                  <div className="text-xs font-bold text-text-primary group-hover:text-primary">
                    Victor Belichar
                  </div>
                  <div className="text-[10px] text-tertiary font-mono">CEO Comercial</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] font-mono text-text-disabled">
          VIBE OS • Design Tech Manaus/AM • Conectado à Lakebase Neon
        </div>
      </div>
    </div>
  );
}
