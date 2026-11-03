/** Deterministic proposal concepts. Intentionally independent of the proposal domain. */
export type ProposalVisual = {
  id: string;
  type: 'site' | 'automacao' | 'redes' | 'logo';
  title: string;
  svg: string;
  width: number;
  height: number;
};

export type ProposalVisualInput = {
  clientName: string;
  serviceType?: string;
  offerTitle?: string;
  scopeText?: string;
  /** Reserved: concepts deliberately do not infer or embed a verified brand. */
  brand?: { primary?: string; logoDataUrl?: string };
};

const INK = '#192C34';
const MUTED = '#51656D';
const PAPER = '#F5F3ED';
const PRIMARY = '#155E63';

function xml(value: string): string {
  return value.replace(/[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/gu, '\uFFFD')
    .replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);
}

function text(x: number, y: number, value: string, size = 20, fill = INK, weight = 400, maxWidth?: number): string {
  // Bound wide glyphs as well as character counts; a long word must not enter the next column.
  const fit = maxWidth && Array.from(value).length * size > maxWidth
    ? ` textLength="${maxWidth}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}"${fit}>${xml(value)}</text>`;
}

function lines(value: string, limit: number, count: number): string[] {
  const words = value.split(/\s+/).flatMap(word => word.match(new RegExp(`.{1,${limit}}`, 'gu')) || []);
  const result: string[] = [];
  let line = '';
  for (const word of words) {
    if (line && `${line} ${word}`.length > limit) { result.push(line); line = ''; }
    line = line ? `${line} ${word}` : word;
  }
  if (line) result.push(line);
  if (result.length > count) result[count - 1] = `${result[count - 1].slice(0, limit - 1)}…`;
  return result.slice(0, count);
}

function block(x: number, y: number, value: string, size: number, lineHeight: number, limit: number, count: number, fill = INK, weight = 400): string {
  const maxWidth = Math.min(1200 - x - 48, limit * size * 0.6);
  return lines(value, limit, count).map((line, index) => text(x, y + index * lineHeight, line, size, fill, weight, maxWidth)).join('');
}

function frame(id: string, type: ProposalVisual['type'], title: string, content: string, height = 800, width = 1200): ProposalVisual {
  return { id, type, title, width, height,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${xml(title)}"><title>${xml(title)}</title><rect width="${width}" height="${height}" fill="${PAPER}"/><g font-family="Arial, Helvetica, sans-serif">${content}${text(48, height - 48, 'Conceito ilustrativo · Conteúdo e identidade sujeitos à aprovação.', 18, MUTED)}</g></svg>` };
}

function site(input: ProposalVisualInput, landing = false): ProposalVisual {
  const heading = input.offerTitle || (landing ? 'Uma página para iniciar a conversa' : 'Um espaço para apresentar sua empresa');
  const scope = input.scopeText || 'Apresentação, serviços e contato em uma navegação clara.';
  const content = `${text(48, 58, `DIREÇÃO DIGITAL / ${landing ? 'LANDING PAGE' : 'SITE INSTITUCIONAL'}`, 18, MUTED, 700)}
    <rect x="42" y="98" width="1116" height="592" rx="20" fill="#FFFFFF" stroke="#DCE3DF"/>
    <path d="M42 186H1158" stroke="#DCE3DF"/>
    ${block(80, 150, input.clientName, 24, 28, 40, 1, INK, 700)}
    ${text(746, 150, 'Sobre', 17, MUTED)}${text(833, 150, 'Serviços', 17, MUTED)}
    <rect x="964" y="119" width="154" height="44" rx="22" fill="${PRIMARY}"/>${text(999, 147, 'Contato', 17, '#FFFFFF', 700)}
    ${text(80, 239, 'SUA EMPRESA, EM FOCO', 15, MUTED, 700)}
    ${block(80, 302, heading, 42, 49, 23, 3, INK, 700)}
    ${block(80, 464, scope, 20, 28, 42, 2, MUTED)}
    <rect x="80" y="526" width="238" height="48" rx="24" fill="${PRIMARY}"/>
    ${text(104, 557, landing ? 'Fale pelo WhatsApp' : 'Fale com a equipe', 19, '#FFFFFF', 700)}
    <rect x="742" y="220" width="376" height="354" rx="18" fill="#EAF0EC"/>
    <circle cx="1008" cy="319" r="66" fill="${PRIMARY}"/>
    <path d="M777 461L863 275L952 461Z" fill="#C5D4C9"/>
    <path d="M880 461L963 355L1080 461Z" fill="#91AAA0"/>
    <rect x="766" y="490" width="328" height="58" rx="12" fill="#FFFFFF"/>
    ${text(786, 515, 'Espaço para imagens da empresa', 16, INK, 700)}
    ${text(786, 537, 'Composição visual provisória', 14, MUTED)}
    ${['01  Apresentação', '02  Serviços', '03  Contato'].map((label, index) => `<rect x="${80 + index * 352}" y="606" width="334" height="50" rx="10" fill="#F5F7F5"/>${text(98 + index * 352, 637, label, 18, MUTED, 700)}`).join('')}`;
  return frame(landing ? 'landing-page' : 'site-institucional', 'site', `${input.clientName} — ${heading}`, `<desc>${xml(scope)}</desc>${content}`);
}

function automation(input: ProposalVisualInput): ProposalVisual {
  const heading = input.offerTitle || 'Um caminho claro para cada conversa';
  const scope = input.scopeText || 'Canais, regras e integrações a confirmar com a equipe.';
  const steps = [
    ['Entrada', 'Canal e mensagem inicial'],
    ['Consentimento', 'Preferências de contato'],
    ['Triagem', 'Necessidade e contexto'],
    ['Equipe', 'Atendimento humano'],
    ['Retorno', 'Próxima etapa combinada'],
  ];
  const content = `${text(48, 58, 'FLUXO COMERCIAL / AUTOMAÇÃO', 18, MUTED, 700)}
    ${block(48, 112, input.clientName, 25, 30, 60, 1, INK, 700)}
    ${block(48, 176, heading, 38, 44, 46, 2, INK, 700)}
    ${block(48, 276, scope, 20, 28, 88, 2, MUTED)}
    ${steps.map(([label, detail], index) => {
      const x = 48 + index * 224;
      return `<rect x="${x}" y="354" width="196" height="212" rx="16" fill="#FFFFFF" stroke="#C5D4C9"/>
        <circle cx="${x + 34}" cy="392" r="18" fill="${PRIMARY}"/>${text(x + 28, 399, String(index + 1), 20, '#FFFFFF', 700)}
        ${text(x + 16, 447, label, 21, INK, 700)}${block(x + 16, 488, detail, 18, 25, 17, 3, MUTED)}
        ${index < 4 ? `<path d="M${x + 198} 454h20m-6-6 6 6-6 6" fill="none" stroke="${PRIMARY}" stroke-width="2"/>` : ''}`;
    }).join('')}
    <rect x="48" y="609" width="1092" height="69" rx="14" fill="#EAF0EC"/>
    ${text(72, 639, 'Fluxo proposto · Regras, permissões e mensagens a validar.', 20, INK, 700)}
    ${text(72, 664, 'Encaminhamento humano previsto; nenhuma integração está ativa neste conceito.', 17, MUTED)}`;
  return frame('automacao-fluxo', 'automacao', `${input.clientName} — ${heading}`, `<desc>${xml(scope)}</desc>${content}`);
}

function social(input: ProposalVisualInput): ProposalVisual[] {
  const heading = input.offerTitle || 'Uma linha editorial para a sua empresa';
  const scope = input.scopeText || 'Temas e conteúdo final dependem de briefing e aprovação.';
  const themes = ['Apresentação', 'Conteúdo útil', 'Conversa'];
  const artwork = [
    `<rect x="48" y="292" width="984" height="472" rx="24" fill="${PRIMARY}"/>
     ${text(88, 356, '01 / APRESENTAR', 20, '#FFFFFF', 700)}
     ${text(88, 444, 'Sua história', 54, '#FFFFFF', 700)}${text(88, 507, 'merece espaço.', 54, '#FFFFFF', 700)}
     ${text(88, 584, 'Quem somos. O que fazemos.', 24, '#FFFFFF')}
     ${text(88, 622, 'Como podemos conversar.', 24, '#FFFFFF')}
     <circle cx="864" cy="611" r="106" fill="#FFFFFF" opacity="0.16"/>
     <path d="M778 708V490h145v218M778 599h145" fill="none" stroke="#FFFFFF" stroke-width="4"/>`,
    `<rect x="48" y="292" width="984" height="472" rx="24" fill="#E5EDE7"/>
     ${text(88, 356, '02 / INFORMAR', 20, MUTED, 700)}
     ${text(88, 420, 'Um tema. Três pontos.', 46, INK, 700)}
     ${['Uma dúvida frequente', 'Um tema do seu segmento', 'Uma orientação da equipe'].map((label, index) => `<rect x="88" y="${460 + index * 84}" width="904" height="66" rx="14" fill="#FFFFFF"/><circle cx="122" cy="${493 + index * 84}" r="21" fill="${PRIMARY}"/>${text(116, 500 + index * 84, String(index + 1), 20, '#FFFFFF', 700)}${text(163, 501 + index * 84, label, 28, INK, 700)}`).join('')}`,
    `<rect x="48" y="292" width="984" height="472" rx="24" fill="${INK}"/>
     ${text(88, 356, '03 / CONVERSAR', 20, '#D6E6DE', 700)}
     <circle cx="905" cy="388" r="42" fill="${PRIMARY}"/>
     ${text(88, 464, 'Vamos conversar?', 58, '#FFFFFF', 700)}
     ${text(88, 524, 'Abra espaço para novas perguntas.', 28, '#D6E6DE')}
     <rect x="88" y="596" width="340" height="70" rx="35" fill="#FFFFFF"/>
     ${text(123, 640, 'Fale com a equipe', 28, INK, 700)}
     ${text(88, 718, 'Canal de contato a definir no briefing.', 20, '#D6E6DE')}`,
  ];
  return themes.map((theme, index) => frame(`redes-post-${index + 1}`, 'redes', `${input.clientName} — ${heading} / ${theme}`,
    `<desc>${xml(scope)}</desc>${text(48, 58, `POST 0${index + 1} / ${theme.toUpperCase()}`, 18, MUTED, 700)}
    ${block(48, 118, input.clientName, 26, 30, 60, 1, INK, 700)}${block(48, 194, heading, 38, 45, 40, 2, INK, 700)}
    ${artwork[index]}${block(48, 828, scope, 24, 32, 66, 2, MUTED)}
    ${text(48, 948, 'Pauta proposta · Textos e imagens sujeitos à aprovação.', 20, MUTED, 700)}`, 1080, 1080));
}

function identity(input: ProposalVisualInput): ProposalVisual {
  const heading = input.offerTitle || 'Estudo de identidade';
  const scope = input.scopeText || 'Linguagem visual inicial para discussão, não uma marca final.';
  const initials = input.clientName.split(/\s+/).filter(Boolean).slice(0, 2)
    .map(word => Array.from(Array.from(word)[0].toUpperCase())[0]).join('');
  const content = `${text(48, 58, 'Estudo de identidade / DIREÇÃO VISUAL', 18, MUTED, 700)}
    ${block(48, 112, input.clientName, 25, 30, 60, 1, INK, 700)}
    ${block(48, 176, heading, 38, 44, 46, 2, INK, 700)}
    <rect x="48" y="280" width="520" height="342" rx="20" fill="#FFFFFF" stroke="#DCE3DF"/>
    <circle cx="308" cy="437" r="118" fill="${PRIMARY}"/>
    <circle cx="308" cy="437" r="136" fill="none" stroke="${PRIMARY}" stroke-width="2"/>
    <text x="308" y="469" text-anchor="middle" font-size="94" font-weight="700" fill="#FFFFFF">${xml(initials)}</text>
    ${text(184, 601, 'Marca provisória · Monograma', 16, MUTED)}
    ${text(624, 321, 'FORMA', 16, MUTED, 700)}${text(624, 355, 'Iniciais e geometria simples', 24, INK, 700)}
    ${text(624, 405, 'PALETA PROPOSTA', 16, MUTED, 700)}
    ${[PRIMARY, INK, '#E5EDE7'].map((color, index) => `<rect x="${624 + index * 144}" y="428" width="128" height="64" rx="12" fill="${color}"/>`).join('')}
    ${text(624, 541, 'APLICAÇÕES A EXPLORAR', 16, MUTED, 700)}
    ${text(624, 578, 'Assinatura, perfil e materiais', 24, INK, 700)}
    ${block(48, 670, scope, 20, 27, 92, 2, MUTED)}`;
  return frame('logo-conceito', 'logo', `${input.clientName} — ${heading}`, `<desc>${xml(scope)}</desc>${content}`);
}

export function generateProposalVisuals(input: ProposalVisualInput): ProposalVisual[] {
  switch (input.serviceType) {
    case 'SITE_INSTITUCIONAL': return [site(input)];
    case 'LANDING_PAGE': return [site(input, true)];
    case 'AUTOMACAO_VENDAS': return [automation(input)];
    case 'GESTAO_REDES_SOCIAIS': return social(input);
    case 'IDENTIDADE_VISUAL': return [identity(input)];
    default: return [];
  }
}
