// ============================================================================
// Análise estratégica de lead (20 min) — 100% determinística, sem API paga.
// Compartilhada entre o endpoint individual e o de lote.
// ============================================================================

export interface LeadAnalysisInput {
  name?: string;
  category?: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
}

export interface SiteProbe {
  title: string | null;
  instagram: string | null;
  whatsapp: string | null;
  emails: string[];
  logoUrl: string | null;
  hasLogo: boolean;
  reachable: boolean;
}

export interface Analise {
  empresa: string;
  categoria: string;
  bairro: string | null;
  posicionamento: { resumo: string; avaliacao: number | null; volumeAvaliacoes: number | null; forca: string };
  logo: { temLogo: boolean; fonte: string; logoUrl: string | null; recomendacao: string };
  site: { temSite: boolean; url: string | null; recomendacao: string };
  redesSociais: { temInstagram: boolean; instagram: string | null; recomendacao: string };
  automacaoWhatsapp: { temWhatsapp: boolean; numero: string | null; nivel: string; recomendacao: string };
  score: number;
  prioridade: string;
  ofertaRecomendada: string;
}

export type GapKey = 'site' | 'automacao' | 'redes' | 'logo';

/** Coleta best-effort do site do lead (com timeout curto, nunca bloqueia). */
export async function probeWebsite(url: string): Promise<SiteProbe> {
  const empty: SiteProbe = { title: null, instagram: null, whatsapp: null, emails: [], logoUrl: null, hasLogo: false, reachable: false };

  let target = url.trim();
  if (!/^https?:\/\//i.test(target)) target = `https://${target}`;

  try {
    const res = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return empty;
    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    const instaMatch = html.match(/instagram\.com\/([a-zA-Z0-9_.-]+)/i);
    const instagram = instaMatch && !['p', 'explore', 'reel'].includes(instaMatch[1]) ? `@${instaMatch[1]}` : null;

    const waMatch = html.match(/(?:wa\.me\/|whatsapp\.com\/send\?phone=)([0-9]+)/i);
    const whatsapp = waMatch ? waMatch[1] : null;

    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emails = Array.from(new Set(html.match(emailRegex) || [])).filter(
      (e) => !/\.(png|jpe?g|webp|gif|svg)$/i.test(e) && !/sentry|wixpress|example\.com/i.test(e)
    );

    const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const favicon = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i)
      || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i);
    const logoImg = html.match(/<img[^>]+(?:alt|src|class|id)=["'][^"']*logo[^"']*["'][^>]*>/i);
    const logoUrl = ogImage?.[1] || favicon?.[1] || null;
    const hasLogo = Boolean(ogImage || favicon || logoImg);

    return { title, instagram, whatsapp, emails: emails.slice(0, 3), logoUrl, hasLogo, reachable: true };
  } catch {
    return empty;
  }
}

export function cleanPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits || null;
}

function extractBairro(address: string | null | undefined): string | null {
  if (!address) return null;
  const parts = address.split('-');
  if (parts.length >= 2) {
    const candidate = parts[1].trim().split(',')[0].trim();
    if (candidate && candidate.length > 2) return candidate;
  }
  return null;
}

export async function analyzeLead(input: LeadAnalysisInput): Promise<Analise> {
  const name = (input.name || '').trim();
  const category = (input.category || 'OUTBOUND').trim();
  const phone = cleanPhone(input.phone);
  const website = input.website?.trim() || null;
  const address = input.address?.trim() || null;
  const rating = typeof input.rating === 'number' ? input.rating : null;
  const ratingCount = typeof input.ratingCount === 'number' ? input.ratingCount : null;

  const probe = website ? await probeWebsite(website) : null;
  const temInstagram = Boolean(probe?.instagram);
  const instagram = probe?.instagram || null;
  const temSite = Boolean(website);
  const temWhatsapp = Boolean(phone);

  const bairro = extractBairro(address);
  let forcaPosicionamento = 'FRACA';
  if (rating && rating >= 4.5) forcaPosicionamento = ratingCount && ratingCount >= 50 ? 'FORTE' : 'MEDIA';
  else if (rating && rating >= 4.0) forcaPosicionamento = 'MEDIA';

  const posicionamentoResumo = `${category}${bairro ? ` em ${bairro}` : ''} com avaliação ${rating ? rating.toFixed(1) : 'sem nota pública'}${ratingCount ? ` (${ratingCount} avaliações)` : ''}. ${forcaPosicionamento === 'FORTE' ? 'Reputação consolidada — alto potencial de conversão via prova social.' : forcaPosicionamento === 'MEDIA' ? 'Reputação em construção — reforçar prova social e presença digital.' : 'Pouca prova social visível — oportunidade clara de posicionamento.'}`;

  const siteRecomendacao = temSite ? 'Possui site. Recomenda-se otimização de velocidade, SEO local e botão de WhatsApp de alta conversão.' : 'Sem site indexado. Alta oportunidade: site institucional + landing page com captura via WhatsApp.';
  const temLogo = Boolean(probe?.hasLogo);
  const logoRecomendacao = temLogo ? 'Identidade visual detectada no site. Revisar consistência de logo nas redes sociais.' : 'Logo não detectada online. Oportunidade de entrega de identidade visual profissional.';
  const redesRecomendacao = temInstagram ? `Instagram ativo (${instagram}). Recomenda-se calendário de conteúdo + carrosséis estratégicos.` : 'Instagram não identificado automaticamente. Oportunidade de gestão de redes sociais completa.';

  let automacaoNivel = 'SEM_AUTOMACAO';
  let automacaoRecomendacao = 'Sem número de WhatsApp identificado. Automação de atendimento + vendas é a principal alavanca.';
  if (temWhatsapp) {
    automacaoNivel = 'MANUAL';
    automacaoRecomendacao = 'WhatsApp ativo, porém atendimento manual. Recomenda-se automação de atendimento, funil de vendas e qualificação de leads 24/7.';
  }
  if (probe?.whatsapp) {
    automacaoNivel = 'LINK_NO_SITE';
    automacaoRecomendacao = 'WhatsApp presente no site. Recomenda-se evoluir para automação de atendimento e recuperação de agendamento.';
  }

  let score = 35;
  if (temSite) score += 15;
  if (temInstagram) score += 15;
  if (temWhatsapp) score += 10;
  if (rating && rating >= 4.5) score += 10;
  if (ratingCount && ratingCount >= 50) score += 10;
  if (probe?.hasLogo) score += 5;
  score = Math.max(0, Math.min(100, score));

  const prioridade = score >= 70 ? 'ALTA' : score >= 45 ? 'MEDIA' : 'BAIXA';
  const ofertaRecomendada = !temSite ? 'Presença Própria' : 'Esteira de Crescimento';

  return {
    empresa: name,
    categoria: category,
    bairro,
    posicionamento: { resumo: posicionamentoResumo, avaliacao: rating, volumeAvaliacoes: ratingCount, forca: forcaPosicionamento },
    logo: { temLogo, fonte: probe?.hasLogo ? 'site' : 'nao_detectada', logoUrl: probe?.logoUrl || null, recomendacao: logoRecomendacao },
    site: { temSite, url: website, recomendacao: siteRecomendacao },
    redesSociais: { temInstagram, instagram, recomendacao: redesRecomendacao },
    automacaoWhatsapp: { temWhatsapp, numero: phone, nivel: automacaoNivel, recomendacao: automacaoRecomendacao },
    score,
    prioridade,
    ofertaRecomendada,
  };
}

/** Detecta as lacunas de presença digital → quais imagens de proposta gerar. */
export function detectGaps(a: Analise): GapKey[] {
  const gaps: GapKey[] = [];
  if (!a.site.temSite) gaps.push('site');
  if (a.automacaoWhatsapp.nivel !== 'LINK_NO_SITE') gaps.push('automacao');
  if (!a.redesSociais.temInstagram) gaps.push('redes');
  if (!a.logo.temLogo) gaps.push('logo');
  return gaps;
}
