import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Envio automatizado de mensagem WhatsApp via Evolution API (self-hosted).
// Requer env vars no ambiente da Vercel:
//   EVOLUTION_API_URL      ex.: http://147.x.x.x:8080
//   EVOLUTION_API_KEY      apikey do Evolution
//   EVOLUTION_INSTANCE     nome da instância com WhatsApp conectado (QR)
// Se não configurado, responde { configured: false } para a UI cair no wa.me.
// ============================================================================

function normalizeNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  // Já em formato internacional (55 + DDD + número)
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  // Nacional BR: completa com 55
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
  return digits;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone, message } = body as { phone?: string; message?: string };

    if (!phone || !message) {
      return NextResponse.json({ success: false, error: 'Telefone e mensagem são obrigatórios.' }, { status: 400 });
    }

    const apiUrl = (process.env.EVOLUTION_API_URL || '').replace(/\/+$/, '');
    const apiKey = process.env.EVOLUTION_API_KEY || '';
    const instance = process.env.EVOLUTION_INSTANCE || '';

    if (!apiUrl || !apiKey || !instance) {
      return NextResponse.json({
        success: false,
        configured: false,
        error: 'Envio automático não configurado (EVOLUTION_API_URL / KEY / INSTANCE ausentes).',
      });
    }

    const number = normalizeNumber(phone);
    if (!number) {
      return NextResponse.json({ success: false, error: 'Número de WhatsApp inválido.' }, { status: 400 });
    }

    const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({ number, text: message }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data?.error || `Evolution API respondeu ${res.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, sent: true, key: data?.key || null, remoteJid: data?.key?.remoteJid || null });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno ao enviar WhatsApp.' },
      { status: 500 }
    );
  }
}
