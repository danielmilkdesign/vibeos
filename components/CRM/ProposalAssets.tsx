'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { generateProposalVisuals, type ProposalVisual } from '../../lib/proposal-visuals';
import { downloadProposalPng, proposalVisualToPng } from '../../lib/proposal-assets';

type Props = {
  proposal: { id: string; clientName: string; serviceType?: string; offerTitle: string; scopeText: string };
  canExport: boolean;
  /** Re-checks the live proposal state at click time; returns an error message to block the download. */
  requireExport?: () => Promise<string | null>;
};

const button = 'rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed';

export default function ProposalAssets({ proposal, canExport, requireExport }: Props) {
  const { clientName, serviceType, offerTitle, scopeText } = proposal;
  const visuals = useMemo(() => generateProposalVisuals({ clientName, serviceType, offerTitle, scopeText }), [clientName, serviceType, offerTitle, scopeText]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const exportKey = JSON.stringify([proposal.id, clientName, serviceType, offerTitle, scopeText, canExport]);
  const latestKey = useRef(exportKey);
  latestKey.current = exportKey;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function download(visual: ProposalVisual) {
    if (canExport !== true || busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    if (requireExport) { const block = await requireExport(); if (block) throw new Error(block); }
    try {
      const blob = await proposalVisualToPng(visual, canExport);
      if (!mounted.current) return;
      if (requireExport) { const block = await requireExport(); if (block) throw new Error(block); }
      if (latestKey.current !== exportKey) throw new Error('A proposta mudou. Confira a prévia e tente novamente.');
      downloadProposalPng(blob, proposal.id, visual.id, canExport);
      setMessage('Download do PNG iniciado. Nenhum envio foi registrado no CRM.');
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'Não foi possível exportar a imagem. Tente novamente.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <section className="min-w-0 space-y-3" aria-label="Imagens da proposta">
      <h3 className="font-semibold text-foreground">Imagens da proposta</h3>
      <p className="text-sm text-muted-foreground">Conceito ilustrativo · composição determinística, não gerada por IA. Identidade não verificada; conteúdo sujeito à aprovação.</p>
      {!canExport && <p className="text-sm text-muted-foreground">Prévia de rascunho. A exportação depende da liberação da proposta.</p>}
      {visuals.length === 0 && <p className="text-sm text-muted-foreground">Sem conceito visual para este serviço.</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        {visuals.map(visual => (
          <figure key={visual.id} className="min-w-0 overflow-hidden rounded-xl border border-border bg-background">
            {/* Local self-contained SVGs; Next image optimization is not needed for data URIs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(visual.svg)}`} alt={`${visual.title} — conceito ilustrativo`} width={visual.width} height={visual.height} className="block h-auto w-full" />
            <figcaption className="space-y-3 p-3">
              <p className="break-words text-sm font-medium text-foreground">{visual.title}</p>
              <button type="button" className={button} disabled={!canExport || busy} onClick={() => download(visual)}>{busy ? 'Gerando PNG…' : 'Baixar PNG'}</button>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
