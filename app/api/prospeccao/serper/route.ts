import { NextRequest, NextResponse } from 'next/server';

interface SerperPlace {
  position?: number;
  title: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  ratingCount?: number;
  category?: string;
  type?: string;
  phoneNumber?: string;
  website?: string;
  cid?: string;
  placeId?: string;
}

function detectNicho(category?: string, query?: string): string {
  const text = `${category || ''} ${query || ''}`.toLowerCase();
  if (text.includes('estétic') || text.includes('estetic') || text.includes('beleza') || text.includes('spa') || text.includes('dermatolog')) {
    return 'ESTETICA';
  }
  if (text.includes('odont') || text.includes('dentist') || text.includes('ortodont')) {
    return 'ODONTOLOGIA';
  }
  if (text.includes('personal') || text.includes('fitness') || text.includes('academi') || text.includes('treino') || text.includes('crossfit')) {
    return 'PERSONAL_TRAINER';
  }
  if (text.includes('medic') || text.includes('médic') || text.includes('clínica') || text.includes('clinica') || text.includes('saúde') || text.includes('saude') || text.includes('hospital')) {
    return 'MEDICINA';
  }
  if (text.includes('advoc') || text.includes('jurídic') || text.includes('juridic') || text.includes('direito') || text.includes('oab')) {
    return 'ADVOCACIA';
  }
  return 'OUTROS';
}

function evaluateDigitalPresence(website?: string, rating?: number, ratingCount?: number) {
  if (!website || website.trim() === '') {
    return {
      hasSite: false,
      isSocialOnly: true,
      diagnostico: 'Sem site móvel próprio indexado. Dependência total do perfil Google/redes sociais.',
      authorityScore: Math.floor(Math.random() * 15) + 8,
      percentSocial: 100,
      urgencia: 'CRITICA' as const,
      potencialFechamento: 2900
    };
  }

  const cleanUrl = website.toLowerCase();
  const isSocialPlatform =
    cleanUrl.includes('instagram.com') ||
    cleanUrl.includes('facebook.com') ||
    cleanUrl.includes('linktr.ee') ||
    cleanUrl.includes('linkbio') ||
    cleanUrl.includes('wa.me') ||
    cleanUrl.includes('whatsapp.com');

  if (isSocialPlatform) {
    return {
      hasSite: false,
      isSocialOnly: true,
      diagnostico: 'Link de bio apontando para agregador/rede social. Perda de 70% de conversões no tráfego frio.',
      authorityScore: Math.floor(Math.random() * 20) + 15,
      percentSocial: 90,
      urgencia: 'CRITICA' as const,
      potencialFechamento: 2600
    };
  }

  return {
    hasSite: true,
    isSocialOnly: false,
    diagnostico: 'Possui domínio próprio registrado. Oportunidade para modernização de infraestrutura e SLA de velocidade.',
    authorityScore: Math.floor(Math.random() * 25) + 35,
    percentSocial: 45,
    urgencia: 'ALTA' as const,
    potencialFechamento: 3400
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      query,
      location = 'Manaus, AM',
      page = 1,
      num = 20,
      apiKey: clientApiKey,
      gl = 'br',
      hl = 'pt-br'
    } = body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'O termo de busca (query) é obrigatório. Ex: "Clínicas de Estética em Manaus".' },
        { status: 400 }
      );
    }

    const effectiveApiKey =
      (clientApiKey && clientApiKey.trim()) ||
      process.env.SERPER_API_KEY ||
      process.env.NEXT_PUBLIC_SERPER_API_KEY;

    if (!effectiveApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chave Serper.dev não configurada. Insira sua chave no painel do Prospecteezy ou configure SERPER_API_KEY no ambiente.',
          requiresApiKey: true
        },
        { status: 401 }
      );
    }

    // Call Serper Places endpoint
    const serperResponse = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': effectiveApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        gl,
        hl,
        page: Number(page) || 1,
        num: Math.min(Number(num) || 20, 100),
        ...(location ? { location } : {})
      }),
      signal: AbortSignal.timeout(18000)
    });

    if (!serperResponse.ok) {
      const errorText = await serperResponse.text();
      return NextResponse.json(
        {
          success: false,
          error: `Erro retornado pelo Serper (${serperResponse.status}): ${errorText.slice(0, 200)}`
        },
        { status: serperResponse.status }
      );
    }

    const serperData = (await serperResponse.json()) as { places?: SerperPlace[]; credits?: number };
    const rawPlaces = serperData.places || [];

    // Map and enrich places into VIBE OS Lead candidates
    const places = rawPlaces.map((place, index) => {
      const nicho = detectNicho(place.category || place.type, query);
      const evalPresence = evaluateDigitalPresence(place.website, place.rating, place.ratingCount);

      // Clean phone numbers and prepare WhatsApp link
      const rawPhone = place.phoneNumber || '';
      const cleanDigits = rawPhone.replace(/\D/g, '');
      const isBrPhone = cleanDigits.length >= 10 && cleanDigits.length <= 11;
      const formattedWhatsapp = isBrPhone ? `55${cleanDigits}` : cleanDigits;

      return {
        id: `serper_${place.placeId || place.cid || Date.now()}_${index}`,
        placeId: place.placeId || null,
        cid: place.cid || null,
        nomeEmpresa: place.title,
        categoria: place.category || place.type || 'Comércio Local',
        nicho,
        localizacao: place.address || location,
        telefoneOriginal: place.phoneNumber || null,
        telefoneLimpo: cleanDigits || null,
        whatsappFormatted: formattedWhatsapp || null,
        website: place.website || null,
        rating: place.rating || null,
        ratingCount: place.ratingCount || 0,
        ...evalPresence,
        source: 'prospecteezy:serper',
        collectedAt: new Date().toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      query,
      location,
      page: Number(page) || 1,
      totalCount: places.length,
      creditsUsed: serperData.credits || 1,
      places
    });
  } catch (error: any) {
    console.error('[Serper API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Falha ao consultar o motor de busca Serper.'
      },
      { status: 500 }
    );
  }
}
