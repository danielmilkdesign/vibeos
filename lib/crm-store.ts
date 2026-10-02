import {
  Lead,
  Opportunity,
  Proposal,
  Project,
  Contract,
  Meeting,
  ComplianceCheck,
  LeadStatus,
  ProjectStatus
} from '../types/crm';
import { INITIAL_LEADS } from './crm-initial-data';

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    companyName: 'Clínica Dra. Juliana Estética',
    title: 'Site de Agendamento + Esteira 5 Artes',
    offerName: 'Solução para Clínicas',
    setupValue: 2200,
    recurringValue: 890,
    estimatedValue: 3090,
    probability: 40,
    stage: 'REUNIAO_AGENDADA',
    nextAction: 'Realizar Análise de 20 min via Google Meet',
    nextActionDate: '2026-10-04',
    ownerName: 'Victor Belém',
    createdAt: '2026-10-01T14:00:00Z',
    updatedAt: '2026-10-02T10:00:00Z'
  },
  {
    id: 'opp-2',
    companyName: 'Studio FitManaus Personal',
    title: 'Presença Própria + Automação Whats',
    offerName: 'Presença Própria',
    setupValue: 1500,
    recurringValue: 99,
    estimatedValue: 1599,
    probability: 30,
    stage: 'ABORDADO_WHATSAPP',
    nextAction: 'Enviar audit do formulário Google Docs',
    nextActionDate: '2026-10-03',
    ownerName: 'Carlos Mendes',
    createdAt: '2026-10-01T14:00:00Z',
    updatedAt: '2026-10-02T09:15:00Z'
  },
  {
    id: 'opp-3',
    companyName: 'OdontoArt Manaus',
    title: 'Redesign Web + Otimização LCP 7 dias',
    offerName: 'Presença Própria',
    setupValue: 3500,
    recurringValue: 199,
    estimatedValue: 3699,
    probability: 65,
    stage: 'PROPOSTA_ENVIADA',
    nextAction: 'Follow-up D+2 envio da proposta',
    nextActionDate: '2026-10-05',
    ownerName: 'Victor Belém',
    createdAt: '2026-10-01T14:00:00Z',
    updatedAt: '2026-10-02T11:00:00Z'
  },
  {
    id: 'opp-4',
    companyName: 'OdontoClin Adrianópolis',
    title: 'Projeto Completo e Integração de Agendamento',
    offerName: 'Solução para Clínicas',
    setupValue: 3200,
    recurringValue: 490,
    estimatedValue: 3690,
    probability: 100,
    stage: 'FECHADO',
    nextAction: 'Kickoff de Onboarding e recebimento de assets',
    nextActionDate: '2026-10-03',
    ownerName: 'Daniel Milk',
    createdAt: '2026-10-01T14:00:00Z',
    updatedAt: '2026-10-02T08:30:00Z'
  }
];

export const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-101',
    proposalNumber: 'VIBE-2026-001',
    clientName: 'Harmonia & Face Estética',
    clientEmail: 'camila@harmoniaeface.com.br',
    clientPhone: '(92) 99456-7890',
    offerTitle: 'Esteira de Crescimento (Landing Page + 5 Artes/mês)',
    setupValue: 2200,
    recurringValue: 890,
    validUntil: '2026-10-15',
    status: 'ENVIADA',
    scopeText: 'Desenvolvimento de Landing Page de Alta Conversão, integração com WhatsApp Business, setup de métricas Google Analytics 4 e plano recorrente de 5 artes mensais.',
    items: [
      { id: 'item-1', description: 'Setup Landing Page Responsiva (SLA 7 dias)', quantity: 1, unitPrice: 2200, total: 2200 },
      { id: 'item-2', description: 'Plano Recorrente 5 Artes Sociais / Mês', quantity: 1, unitPrice: 890, total: 890 }
    ],
    createdAt: '2026-10-02T11:00:00Z'
  }
];

export const INITIAL_PROJECTS_FULL: Project[] = [
  {
    id: 'proj-1',
    nomeEmpresa: 'OdontoClin Adrianópolis',
    clientName: 'Dra. Renata Mello',
    nicho: 'ODONTOLOGIA',
    projectType: 'Solução Clínica',
    status: 'EM_PRODUCAO',
    riskLevel: 'NORMAL',
    progress: 45,
    valorTotal: 3200,
    valorSinal: 1600,
    prazoDias: 7,
    dataInicio: '2026-10-02T08:30:00Z',
    dataPrevisao: '2026-10-09T08:30:00Z',
    checklistNormas: true,
    ownerName: 'Fernanda Rocha',
    tasks: [
      { id: 'tsk-1', projectId: 'proj-1', title: 'Coleta de briefing e fotos da clínica', assignedTo: 'Victor Belém', dueDate: '2026-10-03', completed: true },
      { id: 'tsk-2', projectId: 'proj-1', title: 'Arquitetura de informação e Copywriting', assignedTo: 'Fernanda Rocha', dueDate: '2026-10-04', completed: true },
      { id: 'tsk-3', projectId: 'proj-1', title: 'Design de interface (Figma)', assignedTo: 'Daniel Milk', dueDate: '2026-10-06', completed: false },
      { id: 'tsk-4', projectId: 'proj-1', title: 'Desenvolvimento Next.js & Tailwind', assignedTo: 'Daniel Milk', dueDate: '2026-10-08', completed: false }
    ]
  },
  {
    id: 'proj-2',
    nomeEmpresa: 'Harmonia & Face Estética',
    clientName: 'Dra. Camila Ramos',
    nicho: 'ESTETICA',
    projectType: 'Presença Própria',
    status: 'ONBOARDING',
    riskLevel: 'ATENCAO',
    progress: 15,
    valorTotal: 2800,
    valorSinal: 1400,
    prazoDias: 7,
    dataInicio: '2026-10-02T10:00:00Z',
    dataPrevisao: '2026-10-09T10:00:00Z',
    checklistNormas: true,
    ownerName: 'Fernanda Rocha',
    tasks: [
      { id: 'tsk-5', projectId: 'proj-2', title: 'Aguardando envio do logotipo vetorial e fotos em alta', assignedTo: 'Dra. Camila Ramos (Cliente)', dueDate: '2026-10-03', completed: false }
    ]
  }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'ctr-1',
    contractNumber: 'CTR-VIBE-089',
    companyName: 'OdontoClin Adrianópolis',
    clientName: 'Dra. Renata Mello',
    offerName: 'Plano 5 Artes Mensais',
    setupValue: 3200,
    recurringValue: 490,
    billingPeriod: 'MENSAL',
    dueDay: 10,
    deliveryLimit: 5,
    deliveriesUsed: 2,
    status: 'ATIVO',
    startDate: '2026-10-02',
    renewalDate: '2027-10-02'
  },
  {
    id: 'ctr-2',
    contractNumber: 'CTR-VIBE-074',
    companyName: 'Advocacia Castro & Assis',
    clientName: 'Dr. Roberto Castro',
    offerName: 'Esteira de Crescimento (12 artes + Manutenção)',
    setupValue: 4500,
    recurringValue: 1290,
    billingPeriod: 'MENSAL',
    dueDay: 15,
    deliveryLimit: 12,
    deliveriesUsed: 9,
    status: 'RENOVACAO_PROXIMA',
    startDate: '2025-10-15',
    renewalDate: '2026-10-15'
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'mtg-1',
    companyName: 'OdontoArt Manaus',
    contactName: 'Dr. Fernando Alencar',
    date: '2026-10-05',
    time: '15:30',
    durationMinutes: 20,
    meetingUrl: 'https://meet.google.com/vib-e-os-demo',
    channel: 'GOOGLE_MEET',
    assignedTo: 'Victor Belém',
    status: 'AGENDADA',
    mainBottleneck: 'Site em WordPress 2018 desatualizado, sem conversão mobile',
    recommendedOffer: 'Presença Própria com SLA 7 Dias'
  }
];

export const INITIAL_COMPLIANCE: ComplianceCheck[] = [
  {
    id: 'cmp-1',
    projectName: 'OdontoClin Adrianópolis',
    nicho: 'ODONTOLOGIA',
    identityVerified: true,
    socialProofReviewed: true,
    claimsVerified: true,
    sensitiveDataProtected: true,
    internalApproved: true,
    notes: 'CRO-AM verificado. Fotos antes/depois aprovadas sob resolução CFO.'
  },
  {
    id: 'cmp-2',
    projectName: 'Advocacia Castro & Assis',
    nicho: 'ADVOCACIA',
    identityVerified: true,
    socialProofReviewed: true,
    claimsVerified: true,
    sensitiveDataProtected: true,
    internalApproved: true,
    notes: 'Código de Ética da OAB respeitado. Sem promessa de resultado de causa.'
  }
];

// Helper functions for client state management with LocalStorage fallback
export function getStoredData<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

export function setStoredData<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage`, err);
  }
}
