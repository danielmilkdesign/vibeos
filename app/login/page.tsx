'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { UserRole } from '../../types/crm';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('daniel@vibedesign.com.br');
  const [password, setPassword] = useState('vibe2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedFounder, setSelectedFounder] = useState<'daniel' | 'victor'>('daniel');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Por favor, informe seu e-mail corporativo.');
      return;
    }
    if (!password) {
      setError('Por favor, informe sua senha de acesso.');
      return;
    }
    const result = login(email, password, rememberMe);
    if (!result.success) {
      setError(result.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      return;
    }
    router.push('/');
  };

  const handleToggleFounder = () => {
    setError('');
    if (selectedFounder === 'daniel') {
      setSelectedFounder('victor');
      setEmail('victor@vibedesign.com.br');
      setPassword('vibe2026');
    } else {
      setSelectedFounder('daniel');
      setEmail('daniel@vibedesign.com.br');
      setPassword('vibe2026');
    }
  };

  return (
    <div className="min-h-screen flex items-stretch antialiased selection:bg-[#06B6D4]/20 selection:text-[#06B6D4] overflow-x-hidden bg-[#070B14] text-[#F8FAFC] font-sans">
      <style jsx global>{`
        .grid-pattern {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(30, 41, 59, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 41, 59, 0.35) 1px, transparent 1px);
        }
        .glow-cyan {
          box-shadow: 0 0 50px -10px rgba(6, 182, 212, 0.15);
        }
        .cyber-card {
          background: radial-gradient(120% 120% at 50% 0%, #111C2D 0%, #0D1422 100%);
          border: 1px solid #1E293B;
        }
      `}</style>

      {/* Coluna Esquerda: Apresentação da Marca & Conceito Tech (7/12) */}
      <div className="hidden lg:flex lg:w-7/12 relative flex-col justify-between p-12 lg:p-16 border-r border-[#1E293B] bg-[#070B14] overflow-hidden">
        {/* Grid de Fundo e Luzes de Acento */}
        <div className="absolute inset-0 grid-pattern pointer-events-none opacity-60"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#6366F1]/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Topo da Coluna Esquerda: Marca e Versão */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0D1422] border border-[#06B6D4]/30 flex items-center justify-center shadow-lg shadow-[#06B6D4]/10">
              <svg className="w-6 h-6 text-[#06B6D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l8 12 8-12" />
                <circle cx="12" cy="9" r="2" fill="#10B981" stroke="none" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">VIBE<span className="text-[#06B6D4]">OS</span></span>
              <span className="ml-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-[#64748B] px-2 py-0.5 rounded bg-[#111C2D] border border-[#1E293B]">CRM v2.4</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1422]/80 border border-[#1E293B] text-xs text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="font-mono text-[11px]">Manaus Studio Hub • Ativo</span>
          </div>
        </div>

        {/* Centro da Coluna Esquerda: Narrativa & Visual Operacional */}
        <div className="relative z-10 my-auto max-w-xl py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] text-xs font-semibold tracking-wide uppercase mb-6">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            VIBE Design Tech • Operações Unificadas
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight mb-5">
            O sistema operacional comercial e operacional da{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] via-teal-300 to-sky-400">
              VIBE Design Tech.
            </span>
          </h1>

          <p className="text-lg text-[#94A3B8] font-normal leading-relaxed mb-10">
            Prospecção outbound, vendas consultivas, gestão de projetos com SLA contratual e esteiras de recorrência integradas em um único ecossistema analítico.
          </p>

          {/* Mini-painel com Nós do Ciclo Completo (Spec do Briefing) */}
          <div className="p-6 rounded-2xl bg-[#0D1422]/90 border border-[#1E293B]/80 backdrop-blur-md shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1E293B]/60 pb-3 mb-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"></span>
                Fluxo de Ponta a Ponta Conectado
              </span>
              <span className="text-[11px] font-mono text-[#64748B]">Sync em Tempo Real</span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#111C2D]/70 border border-[#1E293B]">
                <div className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-wider mb-1">01. Prospecção</div>
                <div className="text-xs font-semibold text-white">Outbound &amp; SEO</div>
                <div className="text-[10px] text-[#64748B] mt-1">142 Alvos Mapeados</div>
              </div>
              <div className="p-3 rounded-xl bg-[#111C2D]/70 border border-[#1E293B]">
                <div className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-wider mb-1">02. Pipeline</div>
                <div className="text-xs font-semibold text-white">Kanban &amp; Propostas</div>
                <div className="text-[10px] text-[#64748B] mt-1">R$ 10.779 em Ciclo</div>
              </div>
              <div className="p-3 rounded-xl bg-[#111C2D]/70 border border-[#1E293B]">
                <div className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-wider mb-1">03. Operação</div>
                <div className="text-xs font-semibold text-white">Projetos &amp; SLA</div>
                <div className="text-[10px] text-[#10B981] mt-1">94.2% no Prazo</div>
              </div>
              <div className="p-3 rounded-xl bg-[#111C2D]/70 border border-[#1E293B]">
                <div className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-wider mb-1">04. Gestão</div>
                <div className="text-xs font-semibold text-white">MRR &amp; Recorrência</div>
                <div className="text-[10px] text-[#64748B] mt-1">Planos de Artes &amp; Web</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé da Coluna Esquerda: Segmentos e Credibilidade */}
        <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-[#64748B] pt-6 border-t border-[#1E293B]/60">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#94A3B8]">Segmentos atendidos:</span>
            <span>Clínicas Médicas</span>
            <span>•</span>
            <span>Estética Avançada</span>
            <span>•</span>
            <span>Odontologia</span>
            <span>•</span>
            <span>Advocacia</span>
          </div>
          <div className="font-mono text-[11px] text-[#64748B]">
            vibeos.vibe-tech.design
          </div>
        </div>
      </div>

      {/* Coluna Direita: Formulário de Autenticação (5/12) */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#0A0E17] relative">
        {/* Header Mobile com Logo */}
        <div className="flex lg:hidden items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#0D1422] border border-[#06B6D4]/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#06B6D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 6l8 12 8-12" />
                <circle cx="12" cy="9" r="2" fill="#10B981" stroke="none" />
              </svg>
            </div>
            <span className="text-lg font-extrabold text-white">VIBE<span className="text-[#06B6D4]">OS</span></span>
          </div>
          <span className="text-[10px] font-mono text-[#06B6D4] px-2 py-0.5 rounded bg-[#111C2D] border border-[#1E293B]">CRM</span>
        </div>

        {/* Centro: Card de Login */}
        <div className="my-auto max-w-md w-full mx-auto">
          <div className="cyber-card p-8 sm:p-10 rounded-2xl glow-cyan">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Entrar no VIBE OS</h2>
                <span className="w-2 h-2 rounded-full bg-[#06B6D4]"></span>
              </div>
              <p className="text-sm text-[#94A3B8]">
                Informe suas credenciais corporativas da equipe VIBE Design Tech.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              {/* Campo E-mail */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                  E-mail Profissional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@vibedesign.com.br"
                    className="w-full pl-11 pr-4 py-3 bg-[#070B14] border border-[#1E293B] rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Senha de Acesso
                  </label>
                  <a href="#" className="text-xs text-[#06B6D4] hover:text-cyan-300 transition-colors font-medium">
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-[#070B14] border border-[#1E293B] rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] font-mono transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Lembrar Dispositivo & 2FA Info */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#1E293B] bg-[#070B14] text-[#06B6D4] focus:ring-[#06B6D4] focus:ring-offset-0 focus:ring-1 cursor-pointer accent-[#06B6D4]"
                  />
                  <span className="text-xs text-[#94A3B8]">Lembrar este dispositivo (30 dias)</span>
                </label>
              </div>

              {/* Botão Primário Entrar */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950 font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#06B6D4]/20 hover:shadow-[#06B6D4]/30 active:scale-[0.99] cursor-pointer"
              >
                <span>Acessar Painel Operacional</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {/* Indicador de Status / Sessão Segura */}
            <div className="mt-6 pt-5 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px] text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Criptografia ponta a ponta (TLS 1.3)</span>
              </div>
              <span className="font-mono text-[10px] text-[#64748B]">Sessão Autenticada</span>
            </div>
          </div>

          {/* Quick Switch de Perfil Corporativo para Demonstração (Exato do Stitch) */}
          <div
            onClick={handleToggleFounder}
            className="mt-6 p-3.5 rounded-xl bg-[#0D1422]/60 hover:bg-[#0D1422] border border-[#1E293B]/60 hover:border-[#06B6D4]/40 text-xs text-[#94A3B8] flex items-center justify-between transition-all cursor-pointer group"
            title="Clique para alternar perfil"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#06B6D4]/15 group-hover:bg-[#06B6D4]/25 text-[#06B6D4] font-bold text-xs flex items-center justify-center font-mono transition-colors">
                {selectedFounder === 'daniel' ? 'DM' : 'VB'}
              </div>
              <div>
                <p className="text-white font-medium text-xs leading-none">
                  {selectedFounder === 'daniel' ? 'Daniel Milk' : 'Victor Belichar'}
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  {selectedFounder === 'daniel'
                    ? 'Administrador VIBE • Manaus, AM'
                    : 'CEO & Gestor Comercial • Manaus, AM'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded border border-[#06B6D4]/20 group-hover:bg-[#06B6D4]/20 transition-colors">
              {selectedFounder === 'daniel' ? 'Acesso Total' : 'Comercial'}
            </span>
          </div>
        </div>

        {/* Rodapé Direita */}
        <div className="text-center text-xs text-[#64748B] mt-8">
          <span>VIBE OS &copy; 2026 VIBE Design Tech. Todos os direitos reservados.</span>
        </div>
      </div>
    </div>
  );
}
