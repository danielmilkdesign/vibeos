import { NextRequest, NextResponse } from 'next/server';
import { analyzeLead } from '../../../../lib/lead-analysis';
import { buildProposta } from '../../../../lib/proposta';

// Análise estratégica individual + proposta (texto WhatsApp + imagens).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!body?.name || !String(body.name).trim()) {
      return NextResponse.json({ success: false, error: 'Empresa é obrigatória.' }, { status: 400 });
    }

    const analise = await analyzeLead({
      name: body.name,
      category: body.category,
      phone: body.phone,
      website: body.website,
      address: body.address,
      rating: body.rating,
      ratingCount: body.ratingCount,
    });

    const proposta = buildProposta(analise, analise.empresa, body.phone || null);

    return NextResponse.json({ success: true, analise, proposta });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno na análise do lead.' },
      { status: 500 }
    );
  }
}
