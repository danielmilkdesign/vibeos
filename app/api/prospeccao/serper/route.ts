import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '../../../../lib/server-auth';
import { normalizeNicho, normalizePhone } from '../../../../lib/lead-normalization';
import { analyzeLead } from '../../../../lib/lead-analysis';

const json = (data: unknown, status = 200) => NextResponse.json(data, {status, headers: {'Cache-Control': 'no-store'}});
const str = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value.trim() : null;
const metric = (value: unknown, max: number, integer = false): number | null => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max && (!integer || Number.isInteger(value)) ? value : null;

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (session instanceof Response) return session;
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({success: false, error: 'Busca inválida.'}, 400);
    const query = str(body.query);
    if (!query || query.length > 300) return json({success: false, error: 'Informe um termo de busca de até 300 caracteres.'}, 400);
    const location = str(body.location) || 'Manaus, AM';
    const page = body.page === undefined ? 1 : body.page;
    const num = body.num === undefined ? 20 : body.num;
    if (!Number.isInteger(page) || page < 1 || page > 100 || !Number.isInteger(num) || num < 1 || num > 100 || location.length > 200) return json({success: false, error: 'Paginação ou localização inválida.'}, 400);
    const apiKey = process.env.SERPER_API_KEY?.trim();
    if (!apiKey) return json({success: false, error: 'Consulta indisponível: configure SERPER_API_KEY no servidor.'}, 503);
    const response = await fetch('https://google.serper.dev/places', {
      method: 'POST', headers: {'X-API-KEY': apiKey, 'Content-Type': 'application/json'},
      body: JSON.stringify({q: query, gl: 'br', hl: 'pt-br', page, num, location}), signal: AbortSignal.timeout(18000),
    });
    if (!response.ok) return json({success: false, error: 'O provedor de busca não concluiu a consulta.'}, 502);
    const data = await response.json();
    if (!data || !Array.isArray(data.places)) return json({success: false, error: 'Resposta inválida do provedor de busca.'}, 502);
    const collectedAt = new Date().toISOString();
    const places = data.places.slice(0, num).flatMap((value: unknown, index: number) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
      const place = value as Record<string, unknown>;
      const nomeEmpresa = str(place.title);
      if (!nomeEmpresa) return [];
      const phone = normalizePhone(place.phoneNumber);
      const categoria = str(place.category) || str(place.type);
      const rating = metric(place.rating, 5);
      const ratingCount = metric(place.ratingCount, Number.MAX_SAFE_INTEGER, true);
      const analysis = analyzeLead({website: place.website, phoneWhatsapp: phone, rating, ratingCount, source: 'serper:places', observedAt: collectedAt});
      return [{
        id: `serper_${str(place.placeId) || str(place.cid) || collectedAt}_${index}`,
        placeId: str(place.placeId), cid: str(place.cid), nomeEmpresa, categoria,
        nicho: normalizeNicho(categoria || query), localizacao: str(place.address) || location,
        telefoneOriginal: str(place.phoneNumber), telefoneLimpo: phone, whatsappFormatted: phone,
        website: analysis.facts.websiteUrl, rating, ratingCount, analysis,
        hasSite: null, isSocialOnly: null, diagnostico: 'Análise preliminar dos canais informados; validações pendentes.',
        authorityScore: null, percentSocial: null, urgencia: null, potencialFechamento: null,
        source: 'prospecteezy:serper', collectedAt,
      }];
    });
    return json({success: true, query, location, page, totalCount: places.length, creditsUsed: metric(data.credits, Number.MAX_SAFE_INTEGER), places});
  } catch {
    return json({success: false, error: 'Não foi possível concluir a consulta. Verifique os parâmetros ou tente novamente.'}, 400);
  }
}
