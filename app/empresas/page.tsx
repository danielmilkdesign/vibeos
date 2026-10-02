'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Plus,
  Mail,
  PhoneCall,
  Clock,
  UserCheck,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { getStoredData, setStoredData } from '../../lib/crm-store';
import { INITIAL_COMPANIES } from '../../lib/crm-initial-data';
import { Company, NichoEnum } from '../../types/crm';

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>(() =>
    getStoredData('vibe_companies', INITIAL_COMPANIES)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Company form
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [nicho, setNicho] = useState<NichoEnum>('ESTETICA');
  const [city, setCity] = useState('Manaus');
  const [decisorName, setDecisorName] = useState('');
  const [decisorRole, setDecisorRole] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.decisorName && c.decisorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newComp: Company = {
      id: `comp-${Date.now()}`,
      name,
      tradeName: tradeName || name,
      nicho,
      city,
      state: 'AM',
      website: website || undefined,
      whatsapp: whatsapp || '(92) 99202-7059',
      decisorName: decisorName || 'Decisor a confirmar',
      decisorRole: decisorRole || 'Proprietário(a)',
      decisorPhone: whatsapp || '(92) 99202-7059',
      decisorEmail: 'contato@vibe.tech',
      isClient: false,
      mrr: 0,
      health: 'SAUDAVEL',
      ownerName: 'Victor Belichar',
      createdAt: new Date().toISOString()
    };

    const updated = [newComp, ...companies];
    setCompanies(updated);
    setStoredData('vibe_companies', updated);
    setIsModalOpen(false);
    setName('');
    setTradeName('');
    setDecisorName('');
    setWhatsapp('');
    setWebsite('');
  };

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
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-cyan-400" />
            Cadastro de Empresas & Contas
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Histórico completo de interações, contatos decisores e visão consolidada de projetos e contratos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Nova Empresa / Conta
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por empresa, decisor ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Exibindo <strong className="text-cyan-400">{filtered.length}</strong> empresas cadastradas
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((company) => (
          <div
            key={company.id}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-cyan-700/80 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono text-[10px] border border-slate-700">
                  {company.nicho}
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    company.isClient
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}
                >
                  {company.isClient ? 'CLIENTE ATIVO' : 'PROSPECT'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-100 group-hover:text-cyan-400 transition-colors">
                  {company.name}
                </h3>
                <p className="text-xs text-slate-400">{company.city}, {company.state}</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="text-slate-400 text-[11px] font-semibold">Contato Principal:</p>
                <p className="text-slate-100 font-bold">{company.decisorName || 'A confirmar'}</p>
                <p className="text-slate-400 text-[11px]">{company.decisorRole || 'Representante'}</p>
                {company.whatsapp && (
                  <p className="text-cyan-400 text-[11px] font-mono pt-1">{company.whatsapp}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs font-mono">
                {company.mrr ? (
                  <span className="text-emerald-400 font-bold">MRR: R$ {company.mrr.toLocaleString('pt-BR')}</span>
                ) : (
                  <span className="text-slate-500">Sem contrato ativo</span>
                )}
              </div>
              <Link
                href={`/empresas/${company.id}`}
                className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-900/40 hover:text-cyan-300 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border border-slate-700"
              >
                Abrir Conta <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Empresa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" /> Cadastrar Nova Empresa
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Empresa / Razão Social</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Clínica Dermatológica Manaus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Segmento / Nicho</label>
                <select
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value as NichoEnum)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ESTETICA">Saúde & Estética</option>
                  <option value="ODONTOLOGIA">Clínicas Médicas & Odonto</option>
                  <option value="PERSONAL_TRAINER">Personal Trainers & Fitness</option>
                  <option value="ADVOCACIA">Advocacia & Jurídico</option>
                  <option value="MEDICINA">Medicina Especializada</option>
                  <option value="OUTROS">Empresas & Outros Negócios</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Decisor</label>
                  <input
                    type="text"
                    value={decisorName}
                    onChange={(e) => setDecisorName(e.target.value)}
                    placeholder="Dra. Juliana"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={decisorRole}
                    onChange={(e) => setDecisorRole(e.target.value)}
                    placeholder="Diretora Clínica"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(92) 99202-7059"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Manaus"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25"
                >
                  Salvar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
