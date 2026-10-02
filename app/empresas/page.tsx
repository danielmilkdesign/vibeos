'use client';

import React, { useState } from 'react';
import { Building2, Search, Plus, Mail, PhoneCall, Clock, UserCheck, ChevronRight } from 'lucide-react';
import { getStoredData } from '../../lib/crm-store';
import { INITIAL_LEADS } from '../../lib/crm-initial-data';
import { Lead } from '../../types/crm';

export default function EmpresasPage() {
  const [leads] = useState<Lead[]>(() => getStoredData('vibe_leads', INITIAL_LEADS));
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = leads.filter(l =>
    l.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
              Visão 360° da Conta & Timeline Integrada
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Cadastro de Empresas & Contatos
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Histórico completo de interações, contatos decisores e evolução da conta.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar empresa ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((company) => (
          <div key={company.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-cyan-800/60 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  {company.nicho}
                </span>
                <h3 className="font-bold text-base text-slate-100 mt-1">{company.nomeEmpresa}</h3>
                <p className="text-xs text-slate-400">{company.localizacao}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="text-slate-300 font-semibold">Decisor Responsável:</p>
              <p className="text-slate-100 font-bold">{company.nomeDecisor || 'A confirmar'}</p>
              <p className="text-slate-400 text-[11px]">{company.cargoDecisor || 'N/A'}</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>Status: <strong className="text-cyan-400">{company.status}</strong></span>
              <span>Interações: {company.interacoes?.length || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
