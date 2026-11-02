import { NextRequest, NextResponse } from 'next/server';
import { analyzeLead, Analise } from '../../../../lib/lead-analysis';
import { buildProposta, Proposta } from '../../../../lib/proposta';

// Análise + proposta em lote para leads selecionados na Prospecção.
interface LeadItem {
  id?: string;
  name?: string;
  category?: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
}

export interface LoteResult {
  lead: LeadItem;
  analise: Analise;
  proposta: Proposta;
}

async function pool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const idx = next++;
      results[idx] = await fn(items[idx]);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const leads = (body?.leads || []) as LeadItem[];

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ success: false, error: 'Nenhum lead recebido.' }, { status: 400 });
    }
    if (leads.length > 100) {
      return NextResponse.json({ success: false, error: 'Máximo de 100 leads por lote.' }, { status: 400 });
    }

    const results = await pool<LeadItem, LoteResult>(leads, 6, async (lead) => {
      const analise = await analyzeLead({
        name: lead.name,
        category: lead.category,
        phone: lead.phone,
        website: lead.website,
        address: lead.address,
        rating: lead.rating,
        ratingCount: lead.ratingCount,
      });
      const proposta = buildProposta(analise, analise.empresa, lead.phone || null);
      return { lead, analise, proposta };
    });

    return NextResponse.json({ success: true, count: results.length, results });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno na análise em lote.' },
      { status: 500 }
    );
  }
}
