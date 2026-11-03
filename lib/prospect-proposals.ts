import { buildProspectDraftBatch } from './gerador-propostas';
import type { ProposalDocument } from './proposal-domain';
import type { ProspectInput, SavedProspect, saveProspects } from './prospect-client';

export type PreparedProspect = SavedProspect & { proposals: ProposalDocument[] };
type Dependencies = {
  save: typeof saveProspects;
  read: () => Promise<ProposalDocument[]>;
  write: (proposals: ProposalDocument[]) => Promise<void>;
};

/** Serial per-lead commits bound the work and preserve partial successes on retry. */
export async function prepareProspectProposals(leads: ProspectInput[], deps: Dependencies, progress?: (done: number, total: number) => void) {
  const savedIds: string[] = [];
  const prepared: PreparedProspect[] = [];
  const failures: { id: string; message: string }[] = [];
  let createdCount = 0;
  for (const [index, lead] of leads.entries()) {
    try {
      const saved = await deps.save([lead]);
      savedIds.push(...saved.savedIds);
      const record = saved.records[0];
      if (!record || saved.failures.length) throw new Error(saved.failures[0]?.message || 'CRM não confirmou o contato.');
      const existing = await deps.read();
      const batch = buildProspectDraftBatch([record], existing);
      let confirmed = existing;
      if (batch.created.length) {
        await deps.write(batch.proposals);
        confirmed = await deps.read();
        if (!batch.created.every(draft => confirmed.some(p => p.id === draft.id && p.leadId === record.lead.id))) {
          throw new Error('CRM não confirmou as propostas. Recarregue e tente novamente.');
        }
        createdCount += batch.created.length;
      }
      prepared.push({ ...record, proposals: confirmed.filter(p => p.leadId === record.lead.id) });
    } catch (error) {
      failures.push({ id: lead.id, message: `${lead.name}: ${error instanceof Error ? error.message : 'Falha ao preparar propostas.'}` });
    }
    progress?.(index + 1, leads.length);
  }
  return { savedIds, prepared, failures, createdCount };
}
