'use client';

import React from 'react';
import { Lead, LeadStatus } from '../../types/crm';
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Mail, 
  PhoneCall, 
  ChevronRight,
  Eye
} from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
  onSelectLead: (lead: Lead) => void;
}

const COLUMNS: { id: LeadStatus; label: string; color: string; badge: string }[] = [
  { id: 'LEAD_NOVO', label: 'Lead Novo', color: 'border-slate-700 bg-slate-900/40', badge: 'bg-slate-800 text-slate-300' },
  { id: 'DIAGNOSTICO_GERADO', label: 'Diagnóstico Gerado', color: 'border-cyan-900/50 bg-cyan-950/20', badge: 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' },
  { id: 'ABORDADO_EMAIL', label: 'Abordado (E-mail)', color: 'border-blue-900/50 bg-blue-950/20', badge: 'bg-blue-950 text-blue-400 border border-blue-800/40' },
  { id: 'ABORDADO_WHATSAPP', label: 'Abordado (WhatsApp)', color: 'border-emerald-900/50 bg-emerald-950/20', badge: 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' },
  { id: 'REUNIAO_AGENDADA', label: 'Reunião Agendada', color: 'border-amber-900/50 bg-amber-950/20', badge: 'bg-amber-950 text-amber-400 border border-amber-800/40' },
  { id: 'PROPOSTA_ENVIADA', label: 'Proposta Enviada', color: 'border-purple-900/50 bg-purple-950/20', badge: 'bg-purple-950 text-purple-400 border border-purple-800/40' },
  { id: 'FECHADO', label: 'Ganho / Fechado', color: 'border-emerald-600 bg-emerald-950/40', badge: 'bg-emerald-600 text-white font-bold' },
  { id: 'PERDIDO', label: 'Perdido', color: 'border-rose-900/50 bg-rose-950/20', badge: 'bg-rose-950 text-rose-400 border border-rose-800/40' }
];

export default function KanbanBoard({ leads, onUpdateStatus, onSelectLead }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
      {COLUMNS.map((col) => {
        const columnLeads = leads.filter((l) => l.status === col.id);
        const columnTotal = columnLeads.reduce((acc, curr) => acc + (curr.valorEstimado || 2000), 0);

        return (
          <div
            key={col.id}
            className={`w-80 flex-shrink-0 border rounded-xl p-3 flex flex-col justify-between ${col.color}`}
          >
            {/* Header da Coluna */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${col.id === 'FECHADO' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                  {col.label}
                </h4>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${col.badge}`}>
                  {columnLeads.length}
                </span>
              </div>
              
              <div className="text-[11px] text-slate-400 font-mono mb-3 border-b border-slate-800 pb-2 flex justify-between">
                <span>Total Estimado:</span>
                <span className="text-slate-200 font-semibold">R$ {columnTotal.toLocaleString('pt-BR')}</span>
              </div>

              {/* Cards de Leads */}
              <div className="space-y-3 min-h-[300px]">
                {columnLeads.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-600 text-xs italic">
                    Sem leads nesta etapa
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-cyan-700/60 rounded-lg p-3.5 shadow-md transition-all group"
                    >
                      {/* Urgência & Nicho */}
                      <div className="flex items-center justify-between text-[10px] mb-2">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono rounded">
                          {lead.nicho}
                        </span>
                        {lead.urgencia === 'CRITICA' ? (
                          <span className="flex items-center gap-1 text-rose-400 font-medium">
                            <AlertTriangle className="w-3 h-3" /> Crítica
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> {lead.urgencia}
                          </span>
                        )}
                      </div>

                      {/* Nome Empresa & Local */}
                      <h5 
                        onClick={() => onSelectLead(lead)}
                        className="font-bold text-sm text-slate-100 hover:text-cyan-400 cursor-pointer flex items-center justify-between"
                      >
                        <span className="truncate">{lead.nomeEmpresa}</span>
                        <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" />
                      </h5>
                      <p className="text-[11px] text-slate-400 mb-2 truncate">{lead.localizacao}</p>

                      {/* Decisor & Valor */}
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80 mb-3 space-y-1">
                        <div className="text-[11px] text-slate-300 flex justify-between">
                          <span className="font-medium">{lead.nomeDecisor || 'Decisor n/a'}</span>
                          <span className="text-slate-400 text-[10px]">{lead.cargoDecisor}</span>
                        </div>
                        <div className="text-[10px] text-cyan-400 font-mono flex justify-between pt-1 border-t border-slate-900">
                          <span>Valor: R$ {(lead.valorEstimado || 2000).toLocaleString('pt-BR')}</span>
                          <span>AS: {lead.authorityScore}</span>
                        </div>
                      </div>

                      {/* Ações rápidas de movimentação de Kanban */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px]">
                        <div className="flex gap-1">
                          {lead.emailDecisor && (
                            <a
                              href={`mailto:${lead.emailDecisor}`}
                              className="p-1 bg-slate-800 hover:bg-cyan-900 text-slate-300 hover:text-cyan-300 rounded"
                              title="Enviar E-mail"
                            >
                              <Mail className="w-3 h-3" />
                            </a>
                          )}
                          {lead.phoneWhatsapp && (
                            <a
                              href={`https://wa.me/55${lead.phoneWhatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 bg-slate-800 hover:bg-emerald-900 text-slate-300 hover:text-emerald-300 rounded"
                              title="WhatsApp"
                            >
                              <PhoneCall className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Mudar status para próxima etapa */}
                        <div className="flex items-center gap-1">
                          <select
                            value={lead.status}
                            onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                            className="bg-slate-950 text-slate-300 border border-slate-700 text-[10px] rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-500"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
