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
  department?: string;
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
  leadId?: string;
  companyId?: string;
  tipo: 'EMAIL' | 'WHATSAPP' | 'REUNIAO' | 'NOTA' | 'PROPOSTA' | 'SISTEMA';
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

  fonteColeta?: string;
  ownerName?: string;
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
  lossReason?: string;
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
  companyId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  offerTitle: string;
  setupValue: number;
  recurringValue: number;
  validUntil: string;
  status: ProposalStatus;
  scopeText: string;
  paymentTerms?: string;
  billingPeriod?: 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'UNICO';
  isCustom?: boolean;
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

export type TaskStatus =
  | 'A_FAZER'
  | 'EM_ANDAMENTO'
  | 'EM_REVISAO'
  | 'AGUARDANDO_CLIENTE'
  | 'BLOQUEADA'
  | 'CONCLUIDA';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status?: TaskStatus;
  completed: boolean;
  priority?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  description?: string;
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
  currentBlocker?: string;
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
  companyId?: string;
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
  projectId?: string;
  projectName: string;
  nicho: NichoEnum;
  identityVerified: boolean;
  socialProofReviewed: boolean;
  claimsVerified: boolean;
  sensitiveDataProtected: boolean;
  internalApproved: boolean;
  notes?: string;
  reviewerName?: string;
  reviewedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  tradeName?: string;
  nicho: NichoEnum;
  city: string;
  state: string;
  website?: string;
  instagram?: string;
  whatsapp?: string;
  decisorName?: string;
  decisorRole?: string;
  decisorEmail?: string;
  decisorPhone?: string;
  isClient: boolean;
  mrr: number;
  health: 'SAUDAVEL' | 'ATENCAO' | 'RISCO';
  clientSince?: string;
  ownerName: string;
  notes?: string;
  createdAt: string;
}

export type DeliverableStatus =
  | 'PLANEJADA'
  | 'EM_PRODUCAO'
  | 'REVISAO_INTERNA'
  | 'ENVIADA_CLIENTE'
  | 'AJUSTES_SOLICITADOS'
  | 'APROVADA'
  | 'PUBLICADA';

export interface Deliverable {
  id: string;
  contractId?: string;
  companyName: string;
  title: string;
  type: 'ARTE_REDES' | 'CARROSSEL' | 'REELS_VIDEO' | 'LANDING_PAGE' | 'EBOOK' | 'ANUNCIO';
  cycleMonth: string; // e.g. "2026-10"
  assignedTo: string;
  status: DeliverableStatus;
  dueDate: string;
  fileUrl?: string;
  feedbackClient?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'FOLLOW_UP' | 'REUNIAO' | 'PROPOSTA' | 'TAREFA' | 'APROVACAO' | 'RENOVACAO' | 'ALERTA';
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  entityType: 'LEAD' | 'OPPORTUNITY' | 'PROPOSAL' | 'PROJECT' | 'CONTRACT' | 'COMPANY';
  entityId: string;
  title: string;
  description: string;
  user: string;
  createdAt: string;
}
