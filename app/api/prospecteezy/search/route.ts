import { NextRequest, NextResponse } from "next/server";

// Serper Places devolve no máximo PAGE_SIZE resultados por requisição.
// Para coletar mais, é preciso iterar as páginas (parâmetro `page`).
const PAGE_SIZE = 10;
/** Teto de páginas por execução — protege o crédito Serper do usuário. */
const MAX_PAGES_PER_RUN = 20;
const REQUEST_TIMEOUT_MS = 20_000;

interface SerperPlace {
  cid?: string;
  placeId?: string;
  title?: string;
  phoneNumber?: string | null;
  address?: string | null;
  website?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  category?: string;
  type?: string;
}

const RETRYABLE_STATUS = (status: number) => status === 429 || status >= 500;
const MAX_ATTEMPTS = 3;

/** Busca uma página de places com retry (429/5xx com backoff). */
async function fetchPlacesPage(apiKey: string, query: string, page: number, location?: string): Promise<SerperPlace[]> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Response;
    try {
      response = await fetch("https://google.serper.dev/places", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          q: query,
          gl: "br",
          hl: "pt-br",
          page,
          num: PAGE_SIZE,
          ...(location ? { location } : {}),
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
      continue;
    }
    if (response.ok) {
      const body = (await response.json()) as { places?: SerperPlace[] };
      return body.places ?? [];
    }
    if (!RETRYABLE_STATUS(response.status)) {
      throw new Error(`Serper respondeu ${response.status} na página ${page}: ${await response.text()}`);
    }
    lastError = new Error(`Serper HTTP ${response.status} (página ${page})`);
    if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
  }
  throw new Error(`Serper indisponível após ${MAX_ATTEMPTS} tentativas: ${lastError?.message}`);
}

export async function POST(req: NextRequest) {
  try {
    const { query, location, limit = 20 } = await req.json();

    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SERPER_API_KEY não configurada no ambiente da Vercel." },
        { status: 500 }
      );
    }

    const desired = Math.min(Math.max(Number(limit) || 20, 1), 5000);
    const searchQuery = location ? `${query} em ${location}` : query;
    // Só pede as páginas necessárias para atingir `desired`, com teto de crédito.
    const maxPages = Math.min(Math.ceil(desired / PAGE_SIZE), MAX_PAGES_PER_RUN);

    const seen = new Set<string>();
    const leads: any[] = [];
    let pagesConsumed = 0;
    let exhausted = false;

    // Loop de paginação: cada página traz até PAGE_SIZE items.
    // Para quando: atingir o alvo, página vazia, ou página menor que PAGE_SIZE
    // (sinal de que o Serper não tem mais resultados — é a última página).
    for (let page = 1; page <= maxPages && leads.length < desired; page++) {
      const places = await fetchPlacesPage(apiKey, searchQuery, page, location);
      pagesConsumed += 1;

      if (places.length === 0) {
        exhausted = true;
        break;
      }

      for (const place of places) {
        const key = place.cid || place.placeId || place.title || "";
        if (key && seen.has(key)) continue;
        if (key) seen.add(key);

        leads.push({
          id: place.cid || place.placeId || Math.random().toString(36).substring(2, 9),
          name: place.title || "",
          phone: place.phoneNumber || null,
          address: place.address || null,
          website: place.website || null,
          rating: place.rating || null,
          ratingCount: place.ratingCount || null,
          category: place.category || place.type || "Outbound Serper",
          status: "novo",
        });

        if (leads.length >= desired) break;
      }

      // Página menor que o tamanho máximo = última página do Serper.
      if (places.length < PAGE_SIZE) {
        exhausted = true;
        break;
      }
    }

    return NextResponse.json({
      success: true,
      leads,
      total: leads.length,
      pages_consumed: pagesConsumed,
      exhausted,
      page_size: PAGE_SIZE,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
