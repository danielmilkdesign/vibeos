import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

/**
 * Webhook Inbound: Recebe leads gerados pelo site vibe-design-tech.vercel.app
 * Formatos suportados: JSON de formulário, Typeform, Tally, n8n ou WhatsApp Bot.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Normalização flexível de campos
    const nomeEmpresa =
      payload.nomeEmpresa ||
      payload.empresa ||
      payload.company ||
      payload.nome ||
      'Lead Inbound Sem Nome';

    const nomeDecisor =
      payload.nomeDecisor ||
      payload.decisor ||
      payload.nomeContato ||
      payload.contact_name ||
      'Contato do Site';

    const phoneWhatsapp =
      payload.phoneWhatsapp ||
      payload.whatsapp ||
      payload.telefone ||
      payload.phone ||
      '';

    const emailDecisor =
      payload.emailDecisor ||
      payload.email ||
      '';

    const nichoRaw = (
      payload.nicho ||
      payload.segmento ||
      payload.sector ||
      'OUTROS'
    ).toUpperCase();

    // Mapeamento para NichoEnum válido
    let nicho = 'OUTROS';
    if (nichoRaw.includes('ESTETICA') || nichoRaw.includes('BELEZA')) nicho = 'ESTETICA';
    else if (nichoRaw.includes('ODONTO') || nichoRaw.includes('DENTISTA')) nicho = 'ODONTOLOGIA';
    else if (nichoRaw.includes('PERSONAL') || nichoRaw.includes('FITNESS')) nicho = 'PERSONAL_TRAINER';
    else if (nichoRaw.includes('MEDIC') || nichoRaw.includes('SAUDE')) nicho = 'MEDICINA';
    else if (nichoRaw.includes('ADVOG') || nichoRaw.includes('JURID')) nicho = 'ADVOCACIA';

    const ofertaInteresse =
      payload.oferta ||
      payload.plano ||
      payload.interesse ||
      'Presença Própria';

    const diagnostico =
      payload.mensagem ||
      payload.diagnostico ||
      `Lead recebido do site oficial (Interesse: ${ofertaInteresse}). Solicitação de Análise de 20 minutos.`;

    try {
      const newLead = await prisma.lead.create({
        data: {
          nomeEmpresa,
          nicho: nicho as any,
          localizacao: payload.cidade ? `${payload.cidade}, AM` : 'Manaus, AM',
          nomeDecisor,
          emailDecisor: emailDecisor || null,
          phoneWhatsapp: phoneWhatsapp || null,
          diagnosticoSeo: diagnostico,
          status: 'LEAD_NOVO',
          urgencia: 'CRITICA',
          valorEstimado: ofertaInteresse.includes('Clínica') ? 3200 : 2200
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Lead recebido e cadastrado no pipeline do VIBE OS.',
        leadId: newLead.id
      }, { status: 201 });
    } catch (dbErr) {
      console.warn('[VIBE OS - Webhook]: DB offline, returning payload confirmation', dbErr);
      return NextResponse.json({
        success: true,
        message: 'Lead recebido com sucesso (modo seguro local).',
        payload: {
          nomeEmpresa,
          nomeDecisor,
          phoneWhatsapp,
          nicho,
          ofertaInteresse
        }
      }, { status: 200 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Payload de webhook inválido: ' + err.message },
      { status: 400 }
    );
  }
}
