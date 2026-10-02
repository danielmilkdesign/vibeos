'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Building2,
  Phone,
  Mail,
  MessageSquare,
  Globe,
  Calendar,
  Clock,
  FileText,
  Layers,
  FileCheck,
  History,
  Plus,
  ArrowLeft,
  User,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { INITIAL_COMPANIES } from '../../../lib/crm-initial-data';
import { Company } from '../../../types/crm';

export default function EmpresaDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState<'VISAO_GERAL' | 'CONTATOS' | 'OPORTUNIDADES' | 'PROPOSTAS' | 'PROJETOS' | 'CONTRATOS' | 'TIMELINE' | 'NOTAS'>('VISAO_GERAL');

  const foundCompany = INITIAL_COMPANIES.find(e => e.id === id);

  const empresa = {
    id: id || 'emp-1',
    nomeEmpresa: foundCompany?.name || 'Clínica Dra. Ana Silva',
    nicho: foundCompany?.nicho || 'ESTETICA',
    cidadeEstado: foundCompany ? `${foundCompany.city}, ${foundCompany.state}` : 'Manaus, AM',
    nomeDecisor: foundCompany?.decisorName || 'Dra. Ana Silva',
    cargoDecisor: foundCompany?.decisorRole || 'Proprietária & Médica Dermatologista',
    emailDecisor: foundCompany?.decisorEmail || 'ana.silva@clinica.com.br',
    phoneWhatsapp: foundCompany?.whatsapp || '5592991002233',
    siteUrl: foundCompany?.website || 'https://clinicaanasilva.com.br',
    instagramBio: foundCompany?.instagram || '@dra.anasilva.estetica',
    status: foundCompany?.isClient ? 'CLIENTE_ATIVO' : 'PROSPECT',
    createdAt: foundCompany?.clientSince || '2026-08-10'
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Header */}
      <div>
        <Link
          href="/empresas"
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 mb-4 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Empresas & Contatos
        </Link>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-600/20">
                {empresa.nomeEmpresa.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-100">{empresa.nomeEmpresa}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono font-bold">
                    {empresa.nicho}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[11px] font-mono font-bold">
                    {empresa.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>Decisor: <strong className="text-slate-200">{empresa.nomeDecisor}</strong> ({empresa.cargoDecisor})</span>
                  <span>•</span>
                  <span>{empresa.cidadeEstado}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${empresa.phoneWhatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </a>
              <button className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Nova Oportunidade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-3">
          {(
            [
              { id: 'VISAO_GERAL', label: 'Visão Geral 360°' },
              { id: 'CONTATOS', label: 'Contatos & Decisores' },
              { id: 'OPORTUNIDADES', label: 'Oportunidades' },
              { id: 'PROPOSTAS', label: 'Propostas' },
              { id: 'PROJETOS', label: 'Projetos Ativos' },
              { id: 'CONTRATOS', label: 'Contratos & Recorrência' },
              { id: 'TIMELINE', label: 'Timeline de Interações' },
              { id: 'NOTAS', label: 'Notas Internas' }
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'VISAO_GERAL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
              <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" /> Dados Principais
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-slate-500">Site Oficial:</strong> {empresa.siteUrl || 'Não informado'}</p>
                <p><strong className="text-slate-500">Instagram / Bio:</strong> {empresa.instagramBio || 'Não informado'}</p>
                <p><strong className="text-slate-500">E-mail Comercial:</strong> {empresa.emailDecisor}</p>
                <p><strong className="text-slate-500">Telefone / WhatsApp:</strong> {empresa.phoneWhatsapp}</p>
                <p><strong className="text-slate-500">Cliente desde:</strong> {empresa.createdAt}</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
              <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" /> Resumo Financeiro & Contratos
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-slate-500">MRR Ativo:</strong> <span className="font-mono text-cyan-300 font-bold">R$ 4.500,00 / mês</span></p>
                <p><strong className="text-slate-500">Plano Atual:</strong> Esteira de Crescimento + Mídia</p>
                <p><strong className="text-slate-500">Vencimento da Recorrência:</strong> Dia 10</p>
                <p><strong className="text-slate-500">Status de Pagamento:</strong> <span className="text-emerald-400 font-bold">Em dia</span></p>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'VISAO_GERAL' && (
          <div className="p-8 text-center bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-200 text-sm">Registros de {activeTab.replace('_', ' ')}</h4>
            <p className="text-xs text-slate-400">Todos os dados e histórico desta empresa estão sincronizados com a base unificada do VIBE OS.</p>
          </div>
        )}
      </div>
    </div>
  );
}
