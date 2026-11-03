export type Nicho = 'ESTETICA' | 'ODONTOLOGIA' | 'PERSONAL_TRAINER' | 'MEDICINA' | 'ADVOCACIA' | 'OUTROS';
const keyOf = (value: string) => value.normalize('NFKD').replace(new RegExp('\\p{M}', 'gu'), '').toLowerCase().replace(/[^a-z0-9]/g, '');
const text = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value.trim() : null;

export function normalizeNicho(value: unknown): Nicho {
  const key = keyOf(typeof value === 'string' ? value : '');
  if (/odont|dentist|ortodont/.test(key)) return 'ODONTOLOGIA';
  if (/estetic|beleza|spa|dermatolog/.test(key)) return 'ESTETICA';
  if (/personal|fitness|academi|treino|crossfit/.test(key)) return 'PERSONAL_TRAINER';
  if (/medic|clinic|saude|hospital/.test(key)) return 'MEDICINA';
  if (/advoc|juridic|direito|oab/.test(key)) return 'ADVOCACIA';
  return 'OUTROS';
}

export function normalizeLead(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const fields = new Map(Object.entries(input).map(([key, value]) => [keyOf(key), value]));
  const get = (...keys: string[]): unknown => keys.map(key => fields.get(keyOf(key))).find(value => value !== undefined && value !== null && value !== '');
  const nome = text(get('nome', 'nomeEmpresa', 'nome da empresa', 'company name', 'name', 'razao social', 'razao', 'empresa', 'tradeName'));
  if (!nome) return null;
  const phoneValue = get('phone', 'telefone', 'telefone / whatsapp', 'whatsapp', 'phoneWhatsapp', 'normalizedPhone', 'phone_digits', 'telefoneOriginal', 'phoneNumber');
  const phone = typeof phoneValue === 'number' ? String(phoneValue) : text(phoneValue);
  const phoneDigits = normalizePhone(phone);
  const categoria = text(fields.has('categoria') ? fields.get('categoria') : get('category', 'segment', 'nicho'));
  const numeric = (value: unknown, count = false): number | null => {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    const raw = String(value).trim();
    if (!raw) return null;
    const formatted = count ? raw.replace(/(?<=\d)[.,](?=\d{3}(?:[.,]|$))/g, '') : raw.replace(',', '.');
    const n = Number(formatted);
    return Number.isFinite(n) && n >= 0 && (count ? Number.isInteger(n) : n <= 5) ? n : null;
  };
  const ratingCount = numeric(get('rating_count', 'ratingCount', 'total avaliacoes', 'avaliacoes', 'qtde avaliações', 'quantidade de avaliações', 'reviews', 'reviews count'), true);
  const endereco = text(get('endereco', 'address', 'localizacao', 'location'));
  const website = text(get('website', 'site', 'site_web', 'link', 'linkBio'));
  const inputId = text(get('id', 'externalId', 'external_id', 'sourceId', 'source_id', 'codigo', 'cod'));
  // A provided source id wins; otherwise a stable fingerprint (never just the
  // display name) keeps re-imports without a phone idempotent.
  const fingerprint = phoneDigits ? `phone:${phoneDigits}` : `company:${[nome, endereco || '', website || ''].map(s => s.normalize('NFKC').toLowerCase()).join('|')}`;
  const phoneCanonical = canonicalizePhone(phone);
  return {
    nome, nomeEmpresa: nome, phone: phoneCanonical, phone_digits: phoneDigits, normalizedPhone: phoneCanonical, phoneWhatsapp: phoneCanonical,
    website,
    instagramUrl: text(get('instagram', 'instagramUrl')),
    categoria, nicho: normalizeNicho(get('nicho') ?? categoria),
    externalId: inputId || fingerprint,
    rating: numeric(get('rating', 'avaliacao', 'estrelas')),
    rating_count: ratingCount, ratingCount,
    endereco, localizacao: endereco, status: 'LEAD_NOVO' as const,
  };
}

/** Canonical international digits, never an invented or truncated number. */
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const raw = String(value).trim();
  if (!raw || !/^(?:\+|00)?[\d\s().-]+$/.test(raw)) return null;
  const explicit = raw.startsWith('+') || raw.startsWith('00');
  let digits = raw.replace(/\D/g, '');
  if (raw.startsWith('00')) digits = digits.slice(2);
  if (explicit) return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
  if (/^55\d{10,11}$/.test(digits)) return digits;
  if (/^[1-9]\d{9,10}$/.test(digits)) return `55${digits}`;
  return null;
}

/** Canonical storage form with an explicit DDI marker; normalizePhone returns the same digits for wa.me. */
export function canonicalizePhone(value: unknown): string | null {
  const digits = normalizePhone(value);
  return digits ? `+${digits}` : null;
}
