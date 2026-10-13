import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  LockKeyhole,
  Target,
  UsersRound,
  Workflow,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'VIBE OS — Sistema comercial e operacional',
  description:
    'Prospecção, pipeline, projetos e contratos conectados para a operação da VIBE Design Tech.',
};

const flow = [
  'Prospecção',
  'Qualificação',
  'Análise',
  'Proposta',
  'Projeto',
  'Recorrência',
];

const modules = [
  {
    icon: Target,
    title: 'Prospecção com contexto',
    description:
      'Mapeie empresas, registre diagnósticos e mantenha o próximo passo visível antes de abrir uma oportunidade.',
  },
  {
    icon: BarChart3,
    title: 'Pipeline que prioriza ação',
    description:
      'Acompanhe valor, probabilidade, follow-ups e reuniões em um fluxo comercial conectado.',
  },
  {
    icon: FileText,
    title: 'Propostas sem planilhas soltas',
    description:
      'Estruture escopo, setup, recorrência, validade e versões no mesmo histórico da empresa.',
  },
  {
    icon: ClipboardList,
    title: 'Venda e operação conectadas',
    description:
      'Transforme uma oportunidade ganha em projeto, entregas, aprovações e contrato sem redigitação.',
  },
];

export default function SobrePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-container-lowest text-text-primary">
      <header className="border-b border-border-subtle bg-surface-container-lowest/95 backdrop-blur">
        <nav
          aria-label="Navegação principal"
          className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8"
        >
          <Link href="/sobre" className="flex items-center gap-2 font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-surface text-primary">
              <Workflow aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="text-lg">VIBE<span className="text-primary">OS</span></span>
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border-subtle bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:border-primary/60 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
          >
            Acessar sistema
          </Link>
        </nav>
      </header>

      <main>
        <section className="border-b border-border-subtle">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-24">
            <div className="min-w-0">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                VIBE Design Tech · Operações unificadas
              </p>
              <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl">
                Da prospecção à recorrência, sem perder o próximo passo.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
                VIBE OS centraliza relacionamento comercial, projetos, entregas e contratos para que a equipe da VIBE Design Tech opere com contexto e responsabilidade clara.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-bold text-surface-container-lowest transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
                >
                  Acessar painel operacional <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <a
                  href="#fluxo"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border-subtle bg-surface px-5 text-sm font-semibold text-text-primary transition-colors hover:border-primary/60 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
                >
                  Ver fluxo conectado
                </a>
              </div>
              <p className="mt-4 text-sm text-text-disabled">
                Ambiente interno da VIBE Design Tech. O acesso é restrito a usuários autorizados.
              </p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-2xl shadow-black/20 sm:p-7">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-primary">Visão operacional</p>
                  <h2 className="mt-1 text-lg font-semibold text-text-primary">Uma empresa, uma linha do tempo</h2>
                </div>
                <span className="rounded-full bg-success/10 px-3 py-1 font-mono text-xs font-semibold text-success">Em operação</span>
              </div>
              <ol className="mt-5 space-y-3">
                {[
                  ['Empresa mapeada', 'Diagnóstico e contato principal registrados'],
                  ['Oportunidade qualificada', 'Próximo passo, responsável e prazo definidos'],
                  ['Proposta em negociação', 'Escopo, valores e follow-ups no mesmo histórico'],
                  ['Projeto em execução', 'Entregas, aprovações e riscos acompanhados'],
                ].map(([title, detail], index) => (
                  <li key={title} className="flex gap-3 rounded-xl border border-border-subtle bg-surface-elevated p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                      0{index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-text-primary">{title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-text-secondary">{detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="fluxo" className="border-b border-border-subtle bg-surface">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">Fluxo de ponta a ponta</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-text-primary">
              O comercial não termina quando a proposta é aprovada.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
              O VIBE OS conecta as etapas que normalmente ficam espalhadas entre planilhas, conversas e ferramentas isoladas.
            </p>
            <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {flow.map((step, index) => (
                <li key={step} className="min-w-0 rounded-xl border border-border-subtle bg-surface-container-lowest p-4">
                  <span className="font-mono text-xs text-primary">0{index + 1}</span>
                  <span className="mt-4 block text-sm font-semibold text-text-primary">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">Módulos conectados</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary">
              Informação operacional para agir, não apenas para registrar.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {modules.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-xl border border-border-subtle bg-surface p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-text-primary">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border-subtle bg-surface">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-3">
            <div className="flex gap-3">
              <UsersRound aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-text-primary">Responsável visível</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">Cada oportunidade, projeto e entrega deve ter um dono e um próximo passo claros.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CalendarCheck aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-text-primary">Prazos no contexto</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">Agenda, follow-ups, SLA e renovações aparecem no fluxo de trabalho da equipe.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <LockKeyhole aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-text-primary">Acesso controlado</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">O sistema foi projetado para equipes autorizadas e operações com dados comerciais sensíveis.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-8 sm:p-10">
            <CheckCircle2 aria-hidden="true" className="h-7 w-7 text-primary" />
            <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight text-text-primary">
              Entre para decidir o que precisa acontecer agora.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">
              Acesse o painel operacional para acompanhar prospecção, pipeline, agenda, propostas, projetos e recorrência em um só ambiente.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-bold text-surface-container-lowest transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
            >
              Acessar VIBE OS <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-7 text-sm text-text-disabled sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>VIBE OS · Sistema comercial e operacional da VIBE Design Tech</span>
          <Link href="/login" className="font-medium text-primary hover:text-surface-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Acesso restrito</Link>
        </div>
      </footer>
    </div>
  );
}
