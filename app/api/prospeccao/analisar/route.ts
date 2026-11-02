import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Análise estratégica de lead (20 min) — 100% determinística, sem API paga.
// Gera diagnóstico de posicionamento, logo, site, redes sociais e automação
// de atendimento/vendas no WhatsApp, com score e oferta recomendada.
// ============================================================================

interface AnalyseInput {
  name?: string;
  category?: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
}

interface SiteProbe {
  title: string | null;
  instagram: string | null;
  whatsapp: string | null;
  emails: string[];
  logoUrl: string | null;
  hasLogo: boolean;
  reachable: boolean;
}

/** Coleta best-effort do site do lead (com timeout curto, nunca bloqueia). */
async function probeWebsite(url: string): Promise<SiteProbe> {
  const empty: SiteProbe = {
    title: null,
    instagram: null,
    whatsapp: null,
    emails: [],
    logoUrl: null,
    hasLogo: false,
    reachable: false,
  };

  let target = url.trim();
  if (!/^https?:\/\//i.test(target)) target = `https://${target}`;

  try {
    const res = await fetch(target, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
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

    // Heurística de logo: og:image primeiro, depois favicon, depois <img> com "logo" no alt/src.
    const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const favicon = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i)
      || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i);
    const logoImg = html.match(/<img[^>]+(?:alt|src|class|id)=["'][^"']*logo[^"']*["'][^>]*>/i);
    const logoUrl = ogImage?.[1] || favicon?.[1] || (logoImg ? null : null);
    const hasLogo = Boolean(ogImage || favicon || logoImg);

    return { title, instagram, whatsapp, emails: emails.slice(0, 3), logoUrl: logoUrl || null, hasLogo, reachable: true };
  } catch {
    return empty;
  }
}

function cleanPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  return digits;
}

function extractBairro(address: string | null | undefined): string | null {
  if (!address) return null;
  // Pega o trecho após o primeiro " - " (padrão Serper: "R. X, 123 - Bairro, Cidade - UF")
  const parts = address.split('-');
  if (parts.length >= 2) {
    const candidate = parts[1].trim().split(',')[0].trim();
    if (candidate && candidate.length > 2) return candidate;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as AnalyseInput;
    const name = (body.name || '').trim();
    const category = (body.category || 'OUTBOUND').trim();
    const phone = cleanPhone(body.phone);
    const website = body.website?.trim() || null;
    const address = body.address?.trim() || null;
    const rating = typeof body.rating === 'number' ? body.rating : null;
    const ratingCount = typeof body.ratingCount === 'number' ? body.ratingCount : null;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Empresa é obrigatória.' }, { status: 400 });
    }

    // Prova social via site (best-effort)
    const probe = website ? await probeWebsite(website) : null;
    const temInstagram = Boolean(probe?.instagram);
    const instagram = probe?.instagram || null;
    const temSite = Boolean(website);
    const temWhatsapp = Boolean(phone);

    // ---------- Posicionamento ----------
    const bairro = extractBairro(address);
    let forcaPosicionamento = 'FRACA';
    if (rating && rating >= 4.5) forcaPosicionamento = ratingCount && ratingCount >= 50 ? 'FORTE' : 'MEDIA';
    else if (rating && rating >= 4.0) forcaPosicionamento = 'MEDIA';

    const posicionamentoResumo = `${category}${bairro ? ` em ${bairro}` : ''} com avaliação ${
      rating ? rating.toFixed(1) : 'sem nota pública'
    }${ratingCount ? ` (${ratingCount} avaliações)` : ''}. ${
      forcaPosicionamento === 'FORTE'
        ? 'Reputação consolidada — alto potencial de conversão via prova social.'
        : forcaPosicionamento === 'MEDIA'
        ? 'Reputação em construção — reforçar prova social e presença digital.'
        : 'Pouca prova social visível — oportunidade clara de posicionamento.'
    }`;

    // ---------- Site ----------
    const siteRecomendacao = temSite
      ? 'Possui site. Recomenda-se otimização de velocidade, SEO local e botão de WhatsApp de alta conversão.'
      : 'Sem site indexado. Alta oportunidade: site institucional + landing page com captura via WhatsApp.';

    // ---------- Logo ----------
    const temLogo = Boolean(probe?.hasLogo);
    const logoRecomendacao = temLogo
      ? 'Identidade visual detectada no site. Revisar consistência de logo nas redes sociais.'
      : 'Logo não detectada online. Oportunidade de entrega de identidade visual profissional.';

    // ---------- Redes sociais ----------
    const redesRecomendacao = temInstagram
      ? `Instagram ativo (${instagram}). Recomenda-se calendário de conteúdo + carrosséis estratégicos.`
      : 'Instagram não identificado automaticamente. Oportunidade de gestão de redes sociais completa.';

    // ---------- Automação WhatsApp ----------
    let automacaoNivel = 'SEM_AUTOMACAO';
    let automacaoRecomendacao =
      'Sem número de WhatsApp identificado. Automação de atendimento + vendas é a principal alavanca.';
    if (temWhatsapp) {
      automacaoNivel = 'MANUAL';
      automacaoRecomendacao =
        'WhatsApp ativo, porém atendimento manual. Recomenda-se automação de atendimento, funil de vendas e qualificação de leads 24/7.';
    }
    if (probe?.whatsapp) {
      automacaoNivel = 'LINK_NO_SITE';
      automacaoRecomendacao =
        'WhatsApp presente no site. Recomenda-se evoluir para automação de atendimento e recuperação de carrinho/agendamento.';
    }

    // ---------- Score e prioridade ----------
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

    return NextResponse.json({
      success: true,
      analise: {
        empresa: name,
        categoria: category,
        bairro,
        posicionamento: {
          resumo: posicionamentoResumo,
          avaliacao: rating,
          volumeAvaliacoes: ratingCount,
          forca: forcaPosicionamento,
        },
        logo: { temLogo, fonte: probe?.hasLogo ? 'site' : 'nao_detectada', recomendacao: logoRecomendacao },
        site: { temSite, url: website, recomendacao: siteRecomendacao },
        redesSociais: { temInstagram, instagram, recomendacao: redesRecomendacao },
        automacaoWhatsapp: { temWhatsapp, numero: phone, nivel: automacaoNivel, recomendacao: automacaoRecomendacao },
        score,
        prioridade,
        ofertaRecomendada,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno na análise do lead.' },
      { status: 500 }
    );
  }
}
