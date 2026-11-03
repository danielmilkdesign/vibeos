import { normalizePhone } from './lead-normalization';

export type RecommendedService = 'SITE_INSTITUCIONAL' | 'LANDING_PAGE' | 'AUTOMACAO_VENDAS' | 'GESTAO_REDES_SOCIAIS';
export interface LeadAnalysisInput {
  [key: string]: unknown;
}
const nonempty = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value.trim() : null;
function httpUrl(value: unknown): string | null {
  const raw = nonempty(value);
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}
function channel(url: string): 'social' | 'aggregator' | 'messaging' | 'website' {
  const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  const matches = (domains: string[]) => domains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  if (matches(['instagram.com','facebook.com','tiktok.com','linkedin.com','youtube.com','x.com','twitter.com'])) return 'social';
  if (matches(['linktr.ee','bio.site','beacons.ai','linkbio.co'])) return 'aggregator';
  if (matches(['wa.me','whatsapp.com'])) return 'messaging';
  return 'website';
}

/** Local, non-network analysis of supplied evidence; not a site audit or measured performance. */
export function analyzeLead(input: LeadAnalysisInput = {}) {
  const suppliedAt = nonempty(input.observedAt);
  const observedAt = suppliedAt && Number.isFinite(Date.parse(suppliedAt)) ? new Date(suppliedAt).toISOString() : new Date().toISOString();
  const source = nonempty(input.source) || 'provided-input';
  const websiteUrl = httpUrl(input.website ?? input.linkBio ?? input.websiteUrl);
  const websiteKind = websiteUrl ? channel(websiteUrl) : null;
  const instagramUrl = httpUrl(input.instagramUrl);
  const socialUrls = Array.from(new Set([websiteKind === 'social' ? websiteUrl : null, instagramUrl && channel(instagramUrl) === 'social' ? instagramUrl : null].filter((url): url is string => !!url)));
  const phone = normalizePhone(input.phoneWhatsapp ?? input.normalizedPhone ?? input.phone ?? input.phoneNumber);
  const number = (value: unknown, max: number, integer = false) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max && (!integer || Number.isInteger(value)) ? value : null;
  const facts = {
    websiteUrl, websiteKind, socialUrls, phone,
    hasOwnWebsite: null as boolean | null,
    rating: number(input.rating, 5), ratingCount: number(input.ratingCount ?? input.rating_count, Number.MAX_SAFE_INTEGER, true),
    authorityScore: null, trafegoOrganico: null, palavrasChave: null, percentSocial: null, roi: null,
  };
  const sources = Object.entries(facts).filter(([, value]) => value !== null && (!Array.isArray(value) || value.length)).map(([field, value]) => ({field, value, source, observedAt}));
  const hypotheses: string[] = [];
  const pending = ['Confirmar existência, titularidade e funcionamento do site.', 'Validar necessidades, orçamento e processo comercial com o responsável.', 'Métricas de SEO, tráfego, conversão e retorno não foram medidas.'];
  const recommendedServices: RecommendedService[] = [];
  if (websiteKind && websiteKind !== 'website') {
    hypotheses.push('O link informado é um canal de terceiros; avaliar presença institucional própria com o responsável.');
    recommendedServices.push('SITE_INSTITUCIONAL');
  } else if (websiteKind === 'website') {
    hypotheses.push('URL de site informada; avaliar uma landing page para uma campanha específica, sem pressupor falhas no site.');
    recommendedServices.push('LANDING_PAGE');
  }
  if (phone || websiteKind === 'messaging') {
    hypotheses.push('Canal de contato informado; avaliar se automação de atendimento atende ao processo comercial.');
    recommendedServices.push('AUTOMACAO_VENDAS');
  }
  if (socialUrls.length) {
    hypotheses.push('Perfil social informado; avaliar necessidade de gestão editorial, sem inferir desempenho atual.');
    recommendedServices.push('GESTAO_REDES_SOCIAIS');
  }
  return {facts, sources, observedAt, hypotheses, pending, recommendedServices};
}
