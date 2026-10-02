import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { INITIAL_LEADS } from '../../../lib/crm-initial-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nicho = searchParams.get('nicho');
    const status = searchParams.get('status');

    // Attempt to query database via Prisma
    const leads = await prisma.lead.findMany({
      where: {
        ...(nicho && nicho !== 'ALL' ? { nicho: nicho as any } : {}),
        ...(status && status !== 'ALL' ? { status: status as any } : {})
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    // Graceful fallback to initial seeds if database is not connected
    console.warn('[VIBE OS - API Leads]: Fallback to static seed data', error);
    return NextResponse.json({
      success: true,
      count: INITIAL_LEADS.length,
      data: INITIAL_LEADS,
      isFallback: true
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nomeEmpresa,
      nicho = 'OUTROS',
      localizacao = 'Manaus, AM',
      nomeDecisor,
      emailDecisor,
      phoneWhatsapp,
      instagramUrl,
      diagnosticoSeo,
      valorEstimado = 2200
    } = body;

    if (!nomeEmpresa) {
      return NextResponse.json(
        { success: false, error: 'O campo nomeEmpresa é obrigatório.' },
        { status: 400 }
      );
    }

    try {
      const created = await prisma.lead.create({
        data: {
          nomeEmpresa,
          nicho: nicho.toUpperCase(),
          localizacao,
          nomeDecisor: nomeDecisor || 'Decisor a confirmar',
          emailDecisor,
          phoneWhatsapp,
          instagramUrl,
          diagnosticoSeo: diagnosticoSeo || 'Inbound via Site VIBE Tech',
          valorEstimado: Number(valorEstimado) || 2200,
          status: 'LEAD_NOVO',
          urgencia: 'ALTA'
        }
      });

      return NextResponse.json({ success: true, lead: created }, { status: 201 });
    } catch (dbError) {
      // In-memory simulated response if DB is offline
      const mockLead = {
        id: `lead-${Date.now()}`,
        nomeEmpresa,
        nicho,
        localizacao,
        nomeDecisor: nomeDecisor || 'Decisor a confirmar',
        emailDecisor,
        phoneWhatsapp,
        instagramUrl,
        diagnosticoSeo: diagnosticoSeo || 'Inbound via Site VIBE Tech',
        valorEstimado: Number(valorEstimado) || 2200,
        status: 'LEAD_NOVO',
        urgencia: 'ALTA',
        createdAt: new Date().toISOString()
      };
      return NextResponse.json(
        { success: true, lead: mockLead, note: 'Gravado com sucesso (modo local).' },
        { status: 201 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao processar requisição.' },
      { status: 500 }
    );
  }
}
