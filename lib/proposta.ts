// Geração da proposta (oferta + valores + texto WhatsApp + imagens) a partir da análise.
import { Analise, detectGaps } from './lead-analysis';
import { ProposalImage, generateProposalImages } from './proposal-images';

export interface OfertaPreset {
  setup: number;
  recorrencia: number;
  escopo: string;
}

export const OFERTA_PRESETS: Record<string, OfertaPreset> = {
  'Presença Própria': {
    setup: 1500,
    recorrencia: 99,
    escopo: 'Site institucional de alta conversão + hospedagem em nuvem + SSL + WhatsApp integrado (SLA 7 dias).',
  },
  'Esteira de Crescimento': {
    setup: 2200,
    recorrencia: 890,
    escopo: 'Landing page de alta conversão + 5 artes sociais mensais + relatório de performance.',
  },
  'Plano 5 Artes': { setup: 0, recorrencia: 490, escopo: 'Franquia mensal de 5 artes digitais para redes sociais com aprovação em 24h.' },
  'Plano 12 Artes': { setup: 0, recorrencia: 1290, escopo: 'Franquia mensal de 12 artes e carrosséis com roteiro de copywriting.' },
  'Solução para Clínicas': {
    setup: 3200,
    recorrencia: 490,
    escopo: 'Sistema de agendamento online + landing page de autoridade + conformidade.',
  },
};

export interface Proposta {
  oferta: string;
  setupValue: number;
  recurringValue: number;
  escopo: string;
  texto: string;
  imagens: ProposalImage[];
}

export function buildProposta(analise: Analise, empresa: string, phone: string | null): Proposta {
  const preset = OFERTA_PRESETS[analise.ofertaRecomendada] || OFERTA_PRESETS['Presença Própria'];
  const periodo = preset.recorrencia > 0 ? '/mês' : '';
  const validUntil = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const texto =
    `*PROPOSTA COMERCIAL VIBE DESIGN TECH*\nCliente: ${empresa}\n\n` +
    `*Oferta:* ${analise.ofertaRecomendada}\n` +
    `*Setup Inicial:* R$ ${preset.setup.toLocaleString('pt-BR')}\n` +
    `*Recorrência:* ${preset.recorrencia > 0 ? `R$ ${preset.recorrencia.toLocaleString('pt-BR')}${periodo}` : 'Sem recorrência'}\n` +
    `*Condições:* 50% de entrada + 50% na aprovação final\n` +
    `*Validade:* até ${validUntil}\n\n` +
    `*Escopo de Entrega:*\n${preset.escopo}\n\n` +
    `_Para aprovar e dar início ao projeto, responda esta mensagem._`;

  const gaps = detectGaps(analise);
  const imagens = generateProposalImages(empresa, analise.categoria, gaps, analise.redesSociais.instagram);

  return {
    oferta: analise.ofertaRecomendada,
    setupValue: preset.setup,
    recurringValue: preset.recorrencia,
    escopo: preset.escopo,
    texto,
    imagens,
  };
}
