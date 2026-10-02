'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Video, Plus, CheckCircle2, User, FileText, AlertTriangle } from 'lucide-react';
import { getStoredData, setStoredData, INITIAL_MEETINGS } from '../../lib/crm-store';
import { Meeting } from '../../types/crm';

export default function AgendaPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(() => getStoredData('vibe_meetings', INITIAL_MEETINGS));
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);

  // New Meeting Form State
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('15:00');

  // Diagnostic Form State
  const [bottleneck, setBottleneck] = useState('');
  const [recommendedOffer, setRecommendedOffer] = useState('Presença Própria (R$1.500 setup + R$99/mês)');
  const [nextStep, setNextStep] = useState('');

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;

    const newMeeting: Meeting = {
      id: `mtg-${Date.now()}`,
      companyName,
      contactName: contactName || 'Decisor a confirmar',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '14:30',
      durationMinutes: 20,
      meetingUrl: 'https://meet.google.com/vibe-os-analise',
      channel: 'GOOGLE_MEET',
      assignedTo: 'Victor Belichar (Comercial)',
      status: 'AGENDADA'
    };

    const updated = [newMeeting, ...meetings];
    setMeetings(updated);
    setStoredData('vibe_meetings', updated);
    setIsScheduleModalOpen(false);
    setCompanyName('');
    setContactName('');
  };

  const handleSaveDiagnosticSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;

    const updated = meetings.map((m) =>
      m.id === selectedMeeting.id
        ? {
            ...m,
            status: 'REALIZADA' as const,
            mainBottleneck: bottleneck,
            recommendedOffer: recommendedOffer,
            nextStep: nextStep
          }
        : m
    );

    setMeetings(updated);
    setStoredData('vibe_meetings', updated);
    setIsDiagnosticModalOpen(false);
    setSelectedMeeting(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
              Sessão Diagnóstica de 20 Minutos
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Agenda de Análises & Reuniões
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Agendamento de reuniões comerciais, links do Google Meet e formulário pós-análise.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25"
        >
          <Plus className="w-4 h-4" /> Agendar Nova Análise
        </button>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-cyan-800/60 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40 text-[10px] font-mono">
                  {meeting.status}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> {meeting.time} ({meeting.durationMinutes}m)
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-100">{meeting.companyName}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <User className="w-3.5 h-3.5" /> Decisor: {meeting.contactName}
                </p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                <p className="text-[11px] text-slate-400">Canal: <span className="text-slate-200 font-semibold">{meeting.channel}</span></p>
                <a
                  href={meeting.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:underline font-mono truncate block"
                >
                  {meeting.meetingUrl}
                </a>
              </div>

              {meeting.mainBottleneck && (
                <div className="p-3 bg-cyan-950/30 border border-cyan-900/40 rounded-xl text-xs space-y-1">
                  <p className="font-semibold text-cyan-300">Diagnóstico pós-reunião:</p>
                  <p className="text-slate-300 text-[11px]">{meeting.mainBottleneck}</p>
                  <p className="text-slate-400 text-[10px] mt-1 font-mono">Oferta: {meeting.recommendedOffer}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setSelectedMeeting(meeting);
                  setBottleneck(meeting.mainBottleneck || '');
                  setNextStep(meeting.nextStep || '');
                  setIsDiagnosticModalOpen(true);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Preencher Form Pós-Reunião
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Agendar Reunião de 20 Minutos</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Empresa</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Dra. Juliana Estética"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Decisor Presente</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex: Dra. Juliana Vieira"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data da Reunião</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post-Meeting Diagnostic Form Modal */}
      {isDiagnosticModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Formulário Pós-Análise ({selectedMeeting.companyName})</h3>
            <form onSubmit={handleSaveDiagnosticSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Principal Gargalo Comercial / Digital</label>
                <textarea
                  required
                  value={bottleneck}
                  onChange={(e) => setBottleneck(e.target.value)}
                  placeholder="Ex: Dependência 100% de Instagram Direct, perdendo agendamentos fora do horário comercial..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Oferta Recomendada</label>
                <select
                  value={recommendedOffer}
                  onChange={(e) => setRecommendedOffer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Presença Própria (R$1.500 setup + R$99/mês)">Presença Própria (R$ 1.500 + R$ 99/mês)</option>
                  <option value="Esteira de Crescimento (R$2.200 setup + R$890/mês)">Esteira de Crescimento (R$ 2.200 + R$ 890/mês)</option>
                  <option value="Plano 5 Artes (R$490/mês)">Plano 5 Artes (R$ 490/mês)</option>
                  <option value="Plano 12 Artes (R$1.290/mês)">Plano 12 Artes (R$ 1.290/mês)</option>
                  <option value="Sistema Sob Medida">Sistema Sob Medida</option>
                  <option value="Solução para Clínicas">Solução para Clínicas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Próximo Passo / Data de Follow-up</label>
                <input
                  type="text"
                  required
                  value={nextStep}
                  onChange={(e) => setNextStep(e.target.value)}
                  placeholder="Ex: Enviar Proposta Comercial PDF até amanhã 12:00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDiagnosticModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25"
                >
                  Salvar Diagnóstico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
