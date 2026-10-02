'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, FOUNDER_MAGIC_KEYS } from '../../lib/auth-context';
import Link from 'next/link';

function AcessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithMagicToken } = useAuth();

  const [status, setStatus] = useState<'validating' | 'success' | 'error'>('validating');
  const [founderInfo, setFounderInfo] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const rawToken =
      searchParams.get('token') ||
      searchParams.get('key') ||
      searchParams.get('k') ||
      searchParams.get('user') ||
      '';

    const token = rawToken.trim().toLowerCase();

    if (!token) {
      setStatus('error');
      setErrorMessage(
        'Nenhuma chave de acesso foi informada na URL. Este link é exclusivo para os fundadores da VIBE Design Tech.'
      );
      return;
    }

    // Check against authorized founder keys
    const match =
      FOUNDER_MAGIC_KEYS[token] ||
      (token === 'daniel' || token === 'danielleite'
        ? FOUNDER_MAGIC_KEYS['daniel']
        : token === 'victor' || token === 'victorbelichar'
        ? FOUNDER_MAGIC_KEYS['victor']
        : null);

    if (!match) {
      setStatus('error');
      setErrorMessage(
        'Chave de acesso não autorizada ou expirada. Apenas danielleitedesign@gmail.com e victorbelichar@gmail.com possuem permissão de acesso direto.'
      );
      return;
    }

    // Authenticate the founder
    const result = loginWithMagicToken(match.token, true);

    if (result.success) {
      setFounderInfo({
        name: match.name,
        email: match.email,
        role: match.role === 'ADMINISTRADOR' ? 'CTO (Administrador - Acesso Total)' : 'CEO (Gestor Comercial)'
      });
      setStatus('success');

      // Auto-redirect to dashboard after 1.2s
      const timer = setTimeout(() => {
        router.push('/');
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Erro ao validar chave de acesso.');
    }
  }, [searchParams, loginWithMagicToken, router]);

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glow and grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(30, 41, 59, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.35) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-[#111C2D] to-[#0D1422] border border-[#1E293B] shadow-2xl shadow-cyan-950/30 text-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[#0D1422] border border-[#06B6D4]/30 flex items-center justify-center shadow-lg shadow-[#06B6D4]/10">
            <svg className="w-6 h-6 text-[#06B6D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 6l8 12 8-12" />
              <circle cx="12" cy="9" r="2" fill="#10B981" stroke="none" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-xl font-extrabold tracking-tight text-white">VIBE<span className="text-[#06B6D4]">OS</span></span>
            <span className="ml-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-[#64748B] px-2 py-0.5 rounded bg-[#111C2D] border border-[#1E293B]">GATEWAY</span>
          </div>
        </div>

        {/* Validating State */}
        {status === 'validating' && (
          <div className="py-8 space-y-4">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#06B6D4]" />
            <h2 className="text-lg font-bold text-white">Autenticando Chave de Acesso...</h2>
            <p className="text-xs text-[#94A3B8]">
              Verificando assinatura criptográfica e permissões dos fundadores...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && founderInfo && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-[11px] font-mono font-semibold tracking-wider uppercase mb-2">
                Acesso de Fundador Autorizado
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                Bem-vindo ao VIBE OS
              </h2>
            </div>

            {/* Founder Credentials Card */}
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1E293B] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#64748B] uppercase font-mono tracking-wider">Identidade</span>
                <span className="text-[10px] bg-[#06B6D4]/15 text-[#06B6D4] px-2 py-0.5 rounded font-mono font-bold">
                  Sessão TLS 1.3
                </span>
              </div>
              <div className="text-sm font-bold text-white">{founderInfo.name}</div>
              <div className="text-xs font-mono text-[#06B6D4]">{founderInfo.email}</div>
              <div className="text-[11px] text-[#94A3B8] pt-1 border-t border-[#1E293B]/60">
                {founderInfo.role}
              </div>
            </div>

            {/* Redirect notice */}
            <div className="pt-2">
              <p className="text-xs text-[#94A3B8] flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-ping" />
                <span>Carregando Dashboard Comercial e Operações...</span>
              </p>
              <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-[#06B6D4] h-full w-full animate-[pulse_1s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] font-mono font-semibold tracking-wider uppercase mb-2">
                Acesso Restrito
              </span>
              <h2 className="text-xl font-bold text-white">Chave Inválida</h2>
              <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#070B14] border border-[#1E293B] text-[11px] text-[#64748B] text-left">
              <span className="font-semibold text-[#94A3B8] block mb-1">E-mails autorizados para este link:</span>
              <div className="font-mono text-[#06B6D4]">• danielleitedesign@gmail.com (Daniel Leite)</div>
              <div className="font-mono text-[#06B6D4]">• victorbelichar@gmail.com (Victor Belichar)</div>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-[#06B6D4]/20"
            >
              Ir para Tela de Login Corporativo
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#1E293B]/70 text-[11px] text-[#64748B] font-mono">
          VIBE OS • Design Tech Manaus/AM • Link Exclusivo para Fundadores
        </div>
      </div>
    </div>
  );
}

export default function AcessoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070B14] text-[#F8FAFC] flex items-center justify-center p-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#06B6D4]" />
        </div>
      }
    >
      <AcessoContent />
    </Suspense>
  );
}

