// ============================================================================
// Geração de imagens de proposta (SVG determinístico, sem API paga).
// Cada lacuna detectada gera uma imagem pronta para enviar pelo WhatsApp.
// ============================================================================

export interface ProposalImage {
  type: 'site' | 'automacao' | 'redes' | 'logo';
  title: string;
  svg: string;
  dataUri: string;
}

interface Brand {
  primary: string;
  secondary: string;
  accent: string;
  onDark: string;
}

const PALETTE: Brand[] = [
  { primary: '#06B6D4', secondary: '#0891B2', accent: '#67E8F9', onDark: '#0B1120' },
  { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#C4B5FD', onDark: '#0B1020' },
  { primary: '#10B981', secondary: '#059669', accent: '#6EE7B7', onDark: '#0B1118' },
  { primary: '#F59E0B', secondary: '#D97706', accent: '#FCD34D', onDark: '#15100B' },
  { primary: '#EC4899', secondary: '#DB2777', accent: '#F9A8D4', onDark: '#170B14' },
  { primary: '#6366F1', secondary: '#4F46E5', accent: '#A5B4FC', onDark: '#0B0F1E' },
  { primary: '#F43F5E', secondary: '#E11D48', accent: '#FDA4AF', onDark: '#170B10' },
];

const BG = '#0A0F1D';
const CARD = '#111827';
const BORDER = '#1F2937';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function brandFor(name: string): Brand {
  return PALETTE[hashStr(name) % PALETTE.length];
}

function esc(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initials(name: string): string {
  const words = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'CO';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function toDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ---------------------------------------------------------------------------
// 1) Mockup de SITE (hero + proposta)
// ---------------------------------------------------------------------------
export function generateSiteMockup(company: string, tagline: string): string {
  const b = brandFor(company);
  const N = esc(company);
  const T = esc(tagline || 'Presença digital que converte visitantes em clientes');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${b.primary}" stop-opacity="0.28"/>
      <stop offset="1" stop-color="${b.secondary}" stop-opacity="0.10"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="60" y="48" width="1080" height="534" rx="18" fill="${CARD}" stroke="${BORDER}"/>
  <!-- browser chrome -->
  <rect x="60" y="48" width="1080" height="46" rx="18" fill="#0F172A"/>
  <rect x="60" y="72" width="1080" height="22" fill="#0F172A"/>
  <circle cx="96" cy="71" r="6" fill="#F43F5E"/>
  <circle cx="118" cy="71" r="6" fill="#F59E0B"/>
  <circle cx="140" cy="71" r="6" fill="#10B981"/>
  <rect x="330" y="64" width="540" height="14" rx="7" fill="#1F2937"/>
  <text x="600" y="76" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#64748B">${N}.com.br</text>
  <!-- hero -->
  <rect x="60" y="94" width="1080" height="488" rx="0" fill="url(#hero)"/>
  <rect x="60" y="94" width="1080" height="488" fill="${BG}" opacity="0.55"/>
  <text x="120" y="210" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="${TEXT}">${N}</text>
  <text x="120" y="266" font-family="Arial, sans-serif" font-size="26" fill="${MUTED}">${T}</text>
  <rect x="120" y="310" width="240" height="56" rx="28" fill="${b.primary}"/>
  <text x="240" y="346" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="${b.onDark}">Fale no WhatsApp</text>
  <rect x="380" y="310" width="200" height="56" rx="28" fill="none" stroke="${BORDER}" stroke-width="2"/>
  <text x="480" y="346" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="${TEXT}">Conheça a empresa</text>
  <!-- 3 features -->
  <g font-family="Arial, sans-serif">
    <rect x="120" y="440" width="300" height="110" rx="14" fill="${CARD}" stroke="${BORDER}"/>
    <circle cx="156" cy="478" r="16" fill="${b.primary}" opacity="0.2"/>
    <text x="156" y="484" text-anchor="middle" font-size="16" fill="${b.primary}">01</text>
    <text x="186" y="478" font-size="17" font-weight="bold" fill="${TEXT}">SEO Local</text>
    <text x="186" y="500" font-size="13" fill="${MUTED}">Apareça no Google Maps</text>
    <rect x="450" y="440" width="300" height="110" rx="14" fill="${CARD}" stroke="${BORDER}"/>
    <circle cx="486" cy="478" r="16" fill="${b.primary}" opacity="0.2"/>
    <text x="486" y="484" text-anchor="middle" font-size="16" fill="${b.primary}">02</text>
    <text x="516" y="478" font-size="17" font-weight="bold" fill="${TEXT}">Agendamento</text>
    <text x="516" y="500" font-size="13" fill="${MUTED}">Reservas em 1 clique</text>
    <rect x="780" y="440" width="300" height="110" rx="14" fill="${CARD}" stroke="${BORDER}"/>
    <circle cx="816" cy="478" r="16" fill="${b.primary}" opacity="0.2"/>
    <text x="816" y="484" text-anchor="middle" font-size="16" fill="${b.primary}">03</text>
    <text x="846" y="478" font-size="17" font-weight="bold" fill="${TEXT}">WhatsApp Integrado</text>
    <text x="846" y="500" font-size="13" fill="${MUTED}">Atendimento imediato</text>
  </g>
  <text x="120" y="610" font-family="Arial, sans-serif" font-size="13" fill="#64748B">Proposta VIBE Design Tech • Site institucional de alta conversão</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2) Fluxo de AUTOMAÇÃO de atendimento/vendas
// ---------------------------------------------------------------------------
export function generateAutomationFlow(company: string): string {
  const b = brandFor(company);
  const N = esc(company);
  const steps = [
    ['Cliente chama', 'no WhatsApp'],
    ['Bot responde', 'na hora (24/7)'],
    ['Qualifica', 'perfil e interesse'],
    ['Agenda', 'horário disponível'],
    ['Confirma', 'e faz o follow-up'],
  ];
  const W = 1200, H = 630;
  const boxW = 180, boxH = 120, gap = 42;
  const total = steps.length * boxW + (steps.length - 1) * gap;
  let x0 = (W - total) / 2;
  let nodes = '';
  steps.forEach((s, i) => {
    const x = x0 + i * (boxW + gap);
    nodes += `<rect x="${x}" y="220" width="${boxW}" height="${boxH}" rx="16" fill="${CARD}" stroke="${i === 0 ? b.primary : BORDER}" stroke-width="${i === 0 ? 3 : 1}"/>
    <circle cx="${x + 40}" cy="258" r="18" fill="${b.primary}" opacity="0.18"/>
    <text x="${x + 40}" y="264" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${b.primary}">${i + 1}</text>
    <text x="${x + 22}" y="300" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="${TEXT}">${esc(s[0])}</text>
    <text x="${x + 22}" y="322" font-family="Arial, sans-serif" font-size="13" fill="${MUTED}">${esc(s[1])}</text>`;
    if (i < steps.length - 1) {
      const ax = x + boxW + 8, ay = 280;
      nodes += `<path d="M ${ax} ${ay} L ${ax + 20} ${ay}" stroke="${b.primary}" stroke-width="3" fill="none" marker-end="url(#arr)"/>`;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="${b.primary}"/>
    </marker>
  </defs>
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <text x="600" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="${TEXT}">Automação de Atendimento</text>
  <text x="600" y="152" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="${MUTED}">Como o ${N} atende e vende no piloto automático</text>
  ${nodes}
  <rect x="360" y="420" width="480" height="64" rx="32" fill="${b.primary}"/>
  <text x="600" y="458" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="${b.onDark}">Atendimento 24/7 sem perder nenhum lead</text>
  <text x="600" y="556" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#64748B">Proposta VIBE Design Tech • Automação de atendimento e vendas no WhatsApp</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// 3) Exemplos de POSTS para redes sociais (com logo/monograma)
// ---------------------------------------------------------------------------
export function generateSocialPosts(company: string, handle: string | null): string {
  const b = brandFor(company);
  const N = esc(company);
  const mono = esc(initials(company));
  const socialHandle = handle ? esc(handle) : esc('@' + company.toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  const captions = [
    'Transforme seu treino em resultado. Agende sua avaliação hoje!',
    'Cuidado especializado para você alcançar sua melhor versão.',
    'Novos horários disponíveis esta semana. Garanta o seu!',
  ];
  const W = 1200, H = 630;
  const cardW = 260, cardH = 380, gap = 30;
  const total = 3 * cardW + 2 * gap;
  const x0 = (W - total) / 2;
  let posts = '';
  for (let i = 0; i < 3; i++) {
    const x = x0 + i * (cardW + gap);
    posts += `<rect x="${x}" y="140" width="${cardW}" height="${cardH}" rx="20" fill="${CARD}" stroke="${BORDER}"/>
    <circle cx="${x + 34}" cy="182" r="18" fill="${b.primary}"/>
    <text x="${x + 34}" y="188" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="${b.onDark}">${mono}</text>
    <text x="${x + 60}" y="187" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="${TEXT}">${N}</text>
    <rect x="${x + 16}" y="214" width="${cardW - 32}" height="170" rx="12" fill="${b.primary}" opacity="0.16"/>
    <text x="${x + 146}" y="306" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="bold" fill="${b.primary}">${mono}</text>
    <text x="${x + 18}" y="416" font-family="Arial, sans-serif" font-size="13" fill="${TEXT}">${esc(captions[i])}</text>
    <text x="${x + 18}" y="452" font-family="Arial, sans-serif" font-size="12" fill="${b.primary}">${socialHandle}</text>
    <rect x="${x + 18}" y="470" width="140" height="34" rx="17" fill="${b.primary}"/>
    <text x="${x + 88}" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${b.onDark}">Saiba mais</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <text x="600" y="90" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="${TEXT}">Posts para Redes Sociais</text>
  <text x="600" y="124" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="${MUTED}">Exemplos seguindo a identidade visual da marca</text>
  ${posts}
  <text x="600" y="590" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#64748B">Proposta VIBE Design Tech • Gestão de redes sociais + 5 artes mensais</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// 4) Mockup de LOGO (monograma)
// ---------------------------------------------------------------------------
export function generateLogoMockup(company: string, category: string): string {
  const b = brandFor(company);
  const N = esc(company);
  const mono = esc(initials(company));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${b.primary}"/>
      <stop offset="1" stop-color="${b.secondary}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="${BG}"/>
  <rect x="200" y="90" width="400" height="400" rx="28" fill="${CARD}" stroke="${BORDER}"/>
  <circle cx="400" cy="230" r="88" fill="url(#lg)"/>
  <text x="400" y="264" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="${b.onDark}">${mono}</text>
  <text x="400" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="${TEXT}">${N}</text>
  <text x="400" y="416" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="${MUTED}">${esc(category || 'Identidade visual profissional')}</text>
  <text x="400" y="552" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#64748B">Proposta VIBE Design Tech • Identidade visual (logo + aplicações)</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// Orquestrador: gera as imagens conforme as lacunas detectadas
// ---------------------------------------------------------------------------
export function generateProposalImages(
  company: string,
  category: string,
  gaps: ('site' | 'automacao' | 'redes' | 'logo')[],
  instagram: string | null
): ProposalImage[] {
  const out: ProposalImage[] = [];
  if (gaps.includes('site')) {
    const svg = generateSiteMockup(company, 'Presença digital que atrai e converte clientes');
    out.push({ type: 'site', title: 'Site institucional (hero)', svg, dataUri: toDataUri(svg) });
  }
  if (gaps.includes('automacao')) {
    const svg = generateAutomationFlow(company);
    out.push({ type: 'automacao', title: 'Fluxo de automação de atendimento', svg, dataUri: toDataUri(svg) });
  }
  if (gaps.includes('redes')) {
    const svg = generateSocialPosts(company, instagram);
    out.push({ type: 'redes', title: 'Posts para redes sociais', svg, dataUri: toDataUri(svg) });
  }
  if (gaps.includes('logo')) {
    const svg = generateLogoMockup(company, category);
    out.push({ type: 'logo', title: 'Identidade visual (logo)', svg, dataUri: toDataUri(svg) });
  }
  return out;
}
