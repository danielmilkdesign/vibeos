export type UserRole =
  | 'ADMINISTRADOR'
  | 'GESTOR_COMERCIAL'
  | 'COMERCIAL'
  | 'OPERACOES'
  | 'DESIGN_CONTEUDO'
  | 'FINANCEIRO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  active: boolean;
}

export type LeadStatus =
  | 'LEAD_NOVO'
  | 'DIAGNOSTICO_GERADO'
  | 'ABORDADO_EMAIL'
  | 'ABORDADO_WHATSAPP'
  | 'REUNIAO_AGENDADA'
  | 'PROPOSTA_ENVIADA'
  | 'FECHADO'
  | 'PERDIDO';

export type NichoEnum =
  | 'ESTETICA'
  | 'ODONTOLOGIA'
  | 'PERSONAL_TRAINER'
  | 'MEDICINA'
  | 'ADVOCACIA'
  | 'OUTROS';

export type UrgenciaEnum = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';

export interface Interacao {
  id: string;
  leadId: string;
  tipo: 'EMAIL' | 'WHATSAPP' | 'REUNIAO' | 'NOTA' | 'PROPOSTA';
  conteudo: string;
  autor?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  companyId?: string;
  nomeEmpresa: string;
  nicho: NichoEnum;
  localizacao: string;
  linkBio?: string;
  status: LeadStatus;
  urgencia: UrgenciaEnum;
  
  authorityScore: number;
  trafegoOrganico: number;
  palavrasChave: number;
  percentSocial: number;
  diagnosticoSeo?: string;

  nomeDecisor?: string;
  cargoDecisor?: string;
  emailDecisor?: string;
  phoneWhatsapp?: string;
  instagramUrl?: string;
  valorEstimado?: number;

  interacoes?: Interacao[];
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  companyId?: string;
  title: string;
  companyName: string;
  decisorName?: string;
  offerName: string;
  setupValue: number;
  recurringValue: number;
  estimatedValue: number;
  probability: number;
  stage: LeadStatus;
  nextAction?: string;
  nextActionDate?: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export type ProposalStatus =
  | 'RASCUNHO'
  | 'EM_REVISAO'
  | 'ENVIADA'
  | 'VISUALIZADA'
  | 'NEGOCIACAO'
  | 'APROVADA'
  | 'RECUSADA'
  | 'EXPIRADA';

export interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Proposal {
  id: string;
  proposalNumber: string;
  opportunityId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  offerTitle: string;
  setupValue: number;
  recurringValue: number;
  validUntil: string;
  status: ProposalStatus;
  scopeText: string;
  items?: ProposalItem[];
  createdAt: string;
}

export type TipoProjeto = 'Presença Própria' | 'Esteira de Crescimento' | 'Sistema sob Medida' | 'Solução Clínica';

export type ProjectStatus =
  | 'ONBOARDING'
  | 'EM_PLANEJAMENTO'
  | 'EM_PRODUCAO'
  | 'AGUARDANDO_CLIENTE'
  | 'REVISAO_INTERNA'
  | 'EM_APROVACAO'
  | 'PUBLICACAO'
  | 'CONCLUIDO'
  | 'PAUSADO';

export type RiskLevel = 'NORMAL' | 'ATENCAO' | 'CRITICO';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  leadId?: string;
  companyId?: string;
  nomeEmpresa: string;
  clientName: string;
  nicho: NichoEnum;
  projectType: TipoProjeto;
  status: ProjectStatus;
  riskLevel: RiskLevel;
  progress: number;
  valorTotal: number;
  valorSinal: number;
  prazoDias: number;
  dataInicio: string;
  dataPrevisao: string;
  checklistNormas: boolean;
  ownerName: string;
  tasks?: ProjectTask[];
}

export type Projeto = Project;

export type ContractStatus =
  | 'RASCUNHO'
  | 'EM_ASSINATURA'
  | 'ATIVO'
  | 'PAUSADO'
  | 'RENOVACAO_PROXIMA'
  | 'ENCERRADO'
  | 'CANCELADO';

export interface Contract {
  id: string;
  contractNumber: string;
  companyName: string;
  clientName: string;
  offerName: string;
  setupValue: number;
  recurringValue: number;
  billingPeriod: 'MENSAL' | 'TRIMESTRAL' | 'ANUAL';
  dueDay: number;
  deliveryLimit: number;
  deliveriesUsed: number;
  status: ContractStatus;
  startDate: string;
  renewalDate: string;
}

export interface Meeting {
  id: string;
  companyName: string;
  contactName: string;
  date: string;
  time: string;
  durationMinutes: number;
  meetingUrl: string;
  channel: 'GOOGLE_MEET' | 'WHATSAPP' | 'PRESENCIAL';
  assignedTo: string;
  status: 'AGENDADA' | 'CONFIRMADA' | 'REALIZADA' | 'CANCELADA' | 'NO_SHOW';
  mainBottleneck?: string;
  recommendedOffer?: string;
  nextStep?: string;
}

export interface ComplianceCheck {
  id: string;
  projectName: string;
  nicho: NichoEnum;
  identityVerified: boolean;
  socialProofReviewed: boolean;
  claimsVerified: boolean;
  sensitiveDataProtected: boolean;
  internalApproved: boolean;
  notes?: string;
}
