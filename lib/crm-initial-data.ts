import {
  Lead,
  Company,
  Deliverable,
  Notification,
  TimelineEvent,
  ProjectTask
} from '../types/crm';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    companyId: 'comp-1',
    nomeEmpresa: 'Clínica Dra. Juliana Estética',
    nicho: 'ESTETICA',
    localizacao: 'Manaus - AM (Adrianópolis)',
    linkBio: 'https://instagram.com/drajulianaestetica',
    status: 'REUNIAO_AGENDADA',
    urgencia: 'CRITICA',
    authorityScore: 12,
    trafegoOrganico: 340,
    palavrasChave: 18,
    percentSocial: 85,
    diagnosticoSeo: 'Site antigo sem SSL, tempo de carregamento 8.4s, LinkTree no Instagram direciona para WhatsApp com mensagem genérica.',
    nomeDecisor: 'Dra. Juliana Paes',
    cargoDecisor: 'Proprietária & Médica Dermatologista',
    emailDecisor: 'contato@drajuliana.com.br',
    phoneWhatsapp: '(92) 99123-4567',
    instagramUrl: 'https://instagram.com/drajulianaestetica',
    valorEstimado: 3090,
    fonteColeta: 'Prospecção Manual Instagram',
    ownerName: 'Victor Belém',
    interacoes: [
      { id: 'int-1', tipo: 'WHATSAPP', conteudo: 'Primeiro contato via WhatsApp apresentando o diagnóstico rápido do site.', autor: 'Victor Belém', createdAt: '2026-10-01T10:30:00Z' },
      { id: 'int-2', tipo: 'REUNIAO', conteudo: 'Reunião de 20 min agendada para 04/10 às 15:00.', autor: 'Victor Belém', createdAt: '2026-10-02T09:00:00Z' }
    ],
    createdAt: '2026-09-28T14:00:00Z',
    updatedAt: '2026-10-02T09:00:00Z'
  },
  {
    id: 'lead-2',
    companyId: 'comp-2',
    nomeEmpresa: 'Studio FitManaus Personal',
    nicho: 'PERSONAL_TRAINER',
    localizacao: 'Manaus - AM (Ponta Negra)',
    linkBio: 'https://bio.link/fitmanaus',
    status: 'ABORDADO_WHATSAPP',
    urgencia: 'ALTA',
    authorityScore: 8,
    trafegoOrganico: 120,
    palavrasChave: 5,
    percentSocial: 92,
    diagnosticoSeo: 'Sem presença web própria. Depende 100% do Instagram. Formulário de anamnese em papel.',
    nomeDecisor: 'Lucas Silveira',
    cargoDecisor: 'Head Coach & Founder',
    emailDecisor: 'lucas@fitmanaus.com.br',
    phoneWhatsapp: '(92) 98877-6655',
    instagramUrl: 'https://instagram.com/fitmanaus',
    valorEstimado: 1599,
    fonteColeta: 'Outbound Instagram',
    ownerName: 'Carlos Mendes',
    interacoes: [
      { id: 'int-3', tipo: 'WHATSAPP', conteudo: 'Enviado mini-auditoria da bio e proposta de automação de formulário.', autor: 'Carlos Mendes', createdAt: '2026-10-02T09:15:00Z' }
    ],
    createdAt: '2026-09-29T11:00:00Z',
    updatedAt: '2026-10-02T09:15:00Z'
  },
  {
    id: 'lead-3',
    companyId: 'comp-3',
    nomeEmpresa: 'OdontoArt Manaus',
    nicho: 'ODONTOLOGIA',
    localizacao: 'Manaus - AM (Vieiralves)',
    linkBio: 'https://odontoartmanaus.com.br',
    status: 'PROPOSTA_ENVIADA',
    urgencia: 'MEDIA',
    authorityScore: 45,
    trafegoOrganico: 1250,
    palavrasChave: 94,
    percentSocial: 60,
    diagnosticoSeo: 'WordPress desatualizado (2018), nota LCP 5.2s em mobile, formulário de contato quebrado.',
    nomeDecisor: 'Dr. Fernando Alencar',
    cargoDecisor: 'Diretor Clínico',
    emailDecisor: 'fernando@odontoart.com.br',
    phoneWhatsapp: '(92) 99344-5566',
    instagramUrl: 'https://instagram.com/odontoartmanaus',
    valorEstimado: 3699,
    fonteColeta: 'Google Search Outbound',
    ownerName: 'Victor Belém',
    interacoes: [
      { id: 'int-4', tipo: 'PROPOSTA', conteudo: 'Proposta comercial VIBE-2026-001 enviada com opção de pagamento em 2x.', autor: 'Victor Belém', createdAt: '2026-10-02T11:00:00Z' }
    ],
    createdAt: '2026-09-25T16:00:00Z',
    updatedAt: '2026-10-02T11:00:00Z'
  },
  {
    id: 'lead-4',
    companyId: 'comp-4',
    nomeEmpresa: 'Advocacia Castro & Assis',
    nicho: 'ADVOCACIA',
    localizacao: 'Manaus - AM (Centro)',
    linkBio: 'https://castroassis.adv.br',
    status: 'FECHADO',
    urgencia: 'BAIXA',
    authorityScore: 68,
    trafegoOrganico: 3400,
    palavrasChave: 210,
    percentSocial: 40,
    diagnosticoSeo: 'Excelente tráfego mas sem funil de captura para causas tributárias e cíveis.',
    nomeDecisor: 'Dr. Roberto Castro',
    cargoDecisor: 'Sócio Sênior',
    emailDecisor: 'roberto@castroassis.adv.br',
    phoneWhatsapp: '(92) 98111-2233',
    valorEstimado: 5790,
    fonteColeta: 'Indicação',
    ownerName: 'Daniel Milk',
    createdAt: '2025-10-10T10:00:00Z',
    updatedAt: '2026-10-01T15:00:00Z'
  }
];

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'Clínica Dra. Juliana Estética',
    tradeName: 'Dra. Juliana Estética Avançada',
    nicho: 'ESTETICA',
    city: 'Manaus',
    state: 'AM',
    website: 'https://drajuliana.com.br',
    instagram: 'https://instagram.com/drajulianaestetica',
    whatsapp: '(92) 99123-4567',
    decisorName: 'Dra. Juliana Paes',
    decisorRole: 'Médica Dermatologista',
    decisorEmail: 'contato@drajuliana.com.br',
    decisorPhone: '(92) 99123-4567',
    isClient: false,
    mrr: 0,
    health: 'ATENCAO',
    ownerName: 'Victor Belém',
    createdAt: '2026-09-28T14:00:00Z'
  },
  {
    id: 'comp-2',
    name: 'Studio FitManaus Personal',
    tradeName: 'FitManaus Personal Training',
    nicho: 'PERSONAL_TRAINER',
    city: 'Manaus',
    state: 'AM',
    instagram: 'https://instagram.com/fitmanaus',
    whatsapp: '(92) 98877-6655',
    decisorName: 'Lucas Silveira',
    decisorRole: 'Head Coach',
    decisorEmail: 'lucas@fitmanaus.com.br',
    decisorPhone: '(92) 98877-6655',
    isClient: false,
    mrr: 0,
    health: 'SAUDAVEL',
    ownerName: 'Carlos Mendes',
    createdAt: '2026-09-29T11:00:00Z'
  },
  {
    id: 'comp-3',
    name: 'OdontoClin Adrianópolis',
    tradeName: 'OdontoClin Estética Dental',
    nicho: 'ODONTOLOGIA',
    city: 'Manaus',
    state: 'AM',
    website: 'https://odontoclinadrianopolis.com.br',
    whatsapp: '(92) 99222-3344',
    decisorName: 'Dra. Renata Mello',
    decisorRole: 'Cirurgiã Dentista',
    decisorEmail: 'renata@odontoclin.com.br',
    decisorPhone: '(92) 99222-3344',
    isClient: true,
    mrr: 490,
    health: 'SAUDAVEL',
    clientSince: '2026-10-02',
    ownerName: 'Fernanda Rocha',
    createdAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'comp-4',
    name: 'Advocacia Castro & Assis',
    tradeName: 'Castro & Assis Advogados Associados',
    nicho: 'ADVOCACIA',
    city: 'Manaus',
    state: 'AM',
    website: 'https://castroassis.adv.br',
    whatsapp: '(92) 98111-2233',
    decisorName: 'Dr. Roberto Castro',
    decisorRole: 'Sócio Sênior',
    decisorEmail: 'roberto@castroassis.adv.br',
    decisorPhone: '(92) 98111-2233',
    isClient: true,
    mrr: 1290,
    health: 'ATENCAO',
    clientSince: '2025-10-15',
    ownerName: 'Daniel Milk',
    createdAt: '2025-10-10T10:00:00Z'
  }
];

export const INITIAL_DELIVERABLES: Deliverable[] = [
  {
    id: 'del-1',
    contractId: 'ctr-1',
    companyName: 'OdontoClin Adrianópolis',
    title: 'Arte 01: Antes & Depois Lentes de Contato (CRO compliant)',
    type: 'ARTE_REDES',
    cycleMonth: '2026-10',
    assignedTo: 'Fernanda Rocha',
    status: 'APROVADA',
    dueDate: '2026-10-05',
    fileUrl: 'https://vibeos.storage/deliverables/del-1.png',
    feedbackClient: 'Aprovado sem ressalvas.',
    createdAt: '2026-10-02T10:00:00Z'
  },
  {
    id: 'del-2',
    contractId: 'ctr-1',
    companyName: 'OdontoClin Adrianópolis',
    title: 'Arte 02: Carrossel Educativo - Quando trocar a restauração',
    type: 'CARROSSEL',
    cycleMonth: '2026-10',
    assignedTo: 'Fernanda Rocha',
    status: 'EM_PRODUCAO',
    dueDate: '2026-10-08',
    createdAt: '2026-10-02T10:30:00Z'
  },
  {
    id: 'del-3',
    contractId: 'ctr-2',
    companyName: 'Advocacia Castro & Assis',
    title: 'Reels Vídeo: Mitos sobre Isenção de Imposto de Renda',
    type: 'REELS_VIDEO',
    cycleMonth: '2026-10',
    assignedTo: 'Daniel Milk',
    status: 'ENVIADA_CLIENTE',
    dueDate: '2026-10-06',
    fileUrl: 'https://vibeos.storage/deliverables/del-3.mp4',
    createdAt: '2026-10-01T16:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Análise de 20 min Próxima',
    message: 'Reunião com OdontoArt Manaus agendada para 05/10 às 15:30 via Meet.',
    type: 'REUNIAO',
    linkUrl: '/agenda',
    read: false,
    createdAt: '2026-10-02T12:00:00Z'
  },
  {
    id: 'notif-2',
    title: 'Proposta Próxima do Expirar',
    message: 'Proposta VIBE-2026-001 para Harmonia & Face expira em 13 dias.',
    type: 'PROPOSTA',
    linkUrl: '/propostas',
    read: false,
    createdAt: '2026-10-02T11:00:00Z'
  },
  {
    id: 'notif-3',
    title: 'Renovação de Contrato Próxima',
    message: 'Contrato Advocacia Castro & Assis (CTR-VIBE-074) vence em 13 dias.',
    type: 'RENOVACAO',
    linkUrl: '/contratos',
    read: false,
    createdAt: '2026-10-02T08:00:00Z'
  }
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'tl-1',
    entityType: 'LEAD',
    entityId: 'lead-1',
    title: 'Lead qualificado via Outbound',
    description: 'Lead coletado do Instagram com auditoria SEO de tempo de carregamento 8.4s.',
    user: 'Victor Belém',
    createdAt: '2026-09-28T14:00:00Z'
  },
  {
    id: 'tl-2',
    entityType: 'OPPORTUNITY',
    entityId: 'opp-4',
    title: 'Venda Fechada!',
    description: 'Oportunidade OdontoClin Adrianópolis fechada por R$ 3.200 setup + R$ 490/mês.',
    user: 'Daniel Milk',
    createdAt: '2026-10-02T08:30:00Z'
  }
];

export const INITIAL_TASKS_ALL: ProjectTask[] = [
  {
    id: 'tsk-global-1',
    projectId: 'proj-1',
    title: 'Design de interface no Figma - OdontoClin',
    assignedTo: 'Daniel Milk',
    dueDate: '2026-10-06',
    status: 'EM_ANDAMENTO',
    completed: false,
    priority: 'ALTA',
    description: 'Criar protótipo de alta fidelidade responsivo para validação do cliente.'
  },
  {
    id: 'tsk-global-2',
    projectId: 'proj-2',
    title: 'Aguardando foto da fachada em alta resolução',
    assignedTo: 'Dra. Camila Ramos (Cliente)',
    dueDate: '2026-10-03',
    status: 'AGUARDANDO_CLIENTE',
    completed: false,
    priority: 'URGENTE',
    description: 'Material necessário para inclusão na hero section da Landing Page.'
  },
  {
    id: 'tsk-global-3',
    projectId: 'proj-1',
    title: 'Revisão técnica de conformidade CFO',
    assignedTo: 'Fernanda Rocha',
    dueDate: '2026-10-04',
    status: 'A_FAZER',
    completed: false,
    priority: 'MEDIA',
    description: 'Checar conformidade com resoluções do CFO quanto a imagens de pré e pós-procedimento.'
  }
];
