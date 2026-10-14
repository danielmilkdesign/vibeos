import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json().catch(() => ({}));

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'URL é obrigatória.' }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          status: response.status,
          error: `Site retornou status HTTP ${response.status}`
        });
      }

      const html = await response.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;

      // Extract emails
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
      const rawEmails = Array.from(new Set(html.match(emailRegex) || []));
      // Filter out common false positives and image extensions
      const filteredEmails = rawEmails.filter((email) => {
        const lower = email.toLowerCase();
        return (
          !lower.endsWith('.png') &&
          !lower.endsWith('.jpg') &&
          !lower.endsWith('.jpeg') &&
          !lower.endsWith('.webp') &&
          !lower.includes('sentry') &&
          !lower.includes('wixpress') &&
          !lower.includes('example.com')
        );
      });

      // Extract Instagram handles
      const instaRegex = /(?:instagram\.com\/)([a-zA-Z0-9_.-]+)/gi;
      const instaMatches = Array.from(html.matchAll(instaRegex)).map(m => m[1]).filter(h => h !== 'p' && h !== 'explore');
      const uniqueInstagram = Array.from(new Set(instaMatches));

      // Extract WhatsApp links
      const waRegex = /(?:wa\.me\/|whatsapp\.com\/send\?phone=)([0-9]+)/gi;
      const waMatches = Array.from(html.matchAll(waRegex)).map(m => m[1]);
      const uniqueWhatsapp = Array.from(new Set(waMatches));

      return NextResponse.json({
        success: true,
        url: targetUrl,
        title,
        emails: filteredEmails.slice(0, 5),
        instagram: uniqueInstagram[0] ? `@${uniqueInstagram[0]}` : null,
        whatsapp: uniqueWhatsapp[0] || null,
        isResponsive: true
      });
    } catch (fetchErr: any) {
      return NextResponse.json({
        success: false,
        error: fetchErr.name === 'TimeoutError' ? 'Tempo de resposta excedido ao acessar o site' : 'Não foi possível carregar o site',
        details: fetchErr.message
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno ao analisar site.' },
      { status: 500 }
    );
  }
}
