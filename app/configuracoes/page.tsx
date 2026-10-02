'use client';

import React from 'react';
import { Settings, Shield, UserCheck, DollarSign, Database, CheckCircle2 } from 'lucide-react';
import { DEMO_USERS, useAuth } from '../../lib/auth-context';

export default function ConfiguracoesPage() {
  const { user, switchUserRole } = useAuth();

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
            VIBE OS System Settings
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100">
          Configurações & Matriz de Permissões
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Gestão de usuários, controle de acessos no servidor (RBAC) e preços das ofertas.
        </p>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" /> Matriz de Permissões por Perfil (Seção 5 da Especificação)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Módulo do Sistema</th>
                <th className="p-3.5 text-center">Admin</th>
                <th className="p-3.5 text-center">Gestor Comercial</th>
                <th className="p-3.5 text-center">Comercial / SDR</th>
                <th className="p-3.5 text-center">Operações / PM</th>
                <th className="p-3.5 text-center">Design / Conteúdo</th>
                <th className="p-3.5 text-center">Financeiro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr>
                <td className="p-3.5 font-bold text-slate-200">Usuários & Configuração</td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">Total</td>
                <td className="p-3.5 text-center text-slate-500">Não</td>
                <td className="p-3.5 text-center text-slate-500">Não</td>
                <td className="p-3.5 text-center text-slate-500">Não</td>
                <td className="p-3.5 text-center text-slate-500">Não</td>
                <td className="p-3.5 text-center text-slate-500">Não</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-200">Leads Outbound</td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">Total</td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">Total</td>
                <td className="p-3.5 text-center text-cyan-400">Atribuídos</td>
                <td className="p-3.5 text-center text-amber-400">Leitura</td>
                <td className="p-3.5 text-center text-slate-500">Não</td>
                <td className="p-3.5 text-center text-slate-500">Não</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-200">Pipeline & Oportunidades</td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">Total</td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">Total</td>
                <td className="p-3.5 text-center text-cyan-400">Atribuídas</td>
                <td className="p-3.5 text-center text-amber-400">Leitura</td>
                <td className="p-3.5 text-center text-slate-500">Não</td>
                <td className="p-3.5 text-center text-slate-500">Não</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-200">Propostas Comerciais</td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">Total</td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">Total</td>
                <td className="p-3.5 text-center text-cyan-400">Criar/Editar</td>
                <td className="p-3.5 text-center text-amber-400">Leitura</td>
                <td className="p-3.5 text-center text-slate-500">Não</td>
                <td className="p-3.5 text-center text-amber-400">Leitura</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-200">Esteira de Projetos</td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">Total</td>
                <td className="p-3.5 text-center text-amber-400">Leitura</td>
                <td className="p-3.5 text-center text-amber-400">Leitura</td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">Total</td>
                <td className="p-3.5 text-center text-cyan-400">Atribuídos</td>
                <td className="p-3.5 text-center text-amber-400">Leitura</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-200">Contratos & Recorrência</td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">Total</td>
                <td className="p-3.5 text-center text-amber-400">Leitura</td>
                <td className="p-3.5 text-center text-amber-400">Leitura</td>
                <td className="p-3.5 text-center text-amber-400">Leitura</td>
                <td className="p-3.5 text-center text-slate-500">Não</td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">Total</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Offers Config */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" /> Tabela de Ofertas VIBE (Preços Configuráveis)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-sm text-cyan-400">Presença Própria</h4>
            <p className="text-xs text-slate-400">Setup inicial + Hospedagem e suporte recorrente.</p>
            <div className="pt-2 font-mono text-xs">
              <p className="text-slate-200">Setup: <strong>R$ 1.500</strong></p>
              <p className="text-emerald-400">Recorrência: <strong>R$ 99/mês</strong></p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-sm text-cyan-400">Esteira de Crescimento</h4>
            <p className="text-xs text-slate-400">Landing Page + Conteúdo mensal e gestão de marca.</p>
            <div className="pt-2 font-mono text-xs">
              <p className="text-slate-200">Setup: <strong>R$ 2.200</strong></p>
              <p className="text-emerald-400">Recorrência: <strong>R$ 890/mês</strong></p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-sm text-cyan-400">Plano 5 ou 12 Artes</h4>
            <p className="text-xs text-slate-400">Franquia mensal recorrente de produção de artes.</p>
            <div className="pt-2 font-mono text-xs">
              <p className="text-slate-200">5 Artes: <strong>R$ 490/mês</strong></p>
              <p className="text-emerald-400">12 Artes: <strong>R$ 1.290/mês</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
