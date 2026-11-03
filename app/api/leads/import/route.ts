import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { normalizeLead } from '../../../../lib/lead-normalization';
import { requireSession } from '../../../../lib/server-auth';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 5000;
const MAX_COLUMNS = 100;
const MAX_CELL_CHARS = 10000;
class ImportError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
function csvDelimiter(content: string): string {
  const counts = new Map([[';', 0], [',', 0], ['\t', 0]]);
  let quoted = false;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      if (quoted && content[i + 1] === '"') i++;
      else quoted = !quoted;
    } else if (!quoted) {
      if (char === '\n' || char === '\r') break;
      if (counts.has(char)) counts.set(char, counts.get(char)! + 1);
    }
  }
  return Array.from(counts).sort((a, b) => b[1] - a[1])[0][0];
}
function readRecords(buffer: Buffer, extension: string): unknown[] {
  let records: unknown[];
  if (extension === 'json') {
    const data: unknown = JSON.parse(buffer.toString('utf8').replace(/^\uFEFF/, ''));
    records = Array.isArray(data) ? data : data && typeof data === 'object' && 'leads' in data && Array.isArray(data.leads) ? data.leads : [data];
  } else if (extension === 'xls' || extension === 'xlsx') {
    const workbook = XLSX.read(buffer, {type: 'buffer', sheetRows: MAX_ROWS + 2, sheets: 0, cellHTML: false, cellFormula: false});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new ImportError('Planilha vazia.');
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    if (range.e.c >= MAX_COLUMNS) throw new ImportError('Limite de colunas excedido.');
    records = XLSX.utils.sheet_to_json(sheet, {defval: '', raw: true});
  } else {
    const content = buffer.toString('utf8').replace(/^\uFEFF/, '').trimStart();
    records = parse(content, {delimiter: csvDelimiter(content), bom: true, columns: true, skip_empty_lines: true, trim: true, max_record_size: MAX_COLUMNS * MAX_CELL_CHARS, to: MAX_ROWS + 1});
  }
  if (records.length > MAX_ROWS) throw new ImportError('Limite de 5000 linhas excedido.', 413);
  if (records.some(row => row && typeof row === 'object' && (Object.keys(row).length > MAX_COLUMNS || Object.values(row).some(value => typeof value === 'string' && value.length > MAX_CELL_CHARS)))) throw new ImportError('Limite de colunas ou tamanho de campo excedido.', 413);
  return records;
}
export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (session instanceof Response) return session;
  try {
    if (Number(request.headers.get('content-length')) > MAX_FILE_BYTES + 64 * 1024) throw new ImportError('Arquivo excede o limite de 5 MB.', 413);
    // Bound bytes before multipart parsing, even for chunked bodies or false headers.
    if (!request.body) throw new ImportError('Nenhum arquivo enviado.');
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > MAX_FILE_BYTES + 64 * 1024) {
          await reader.cancel();
          throw new ImportError('Arquivo excede o limite de 5 MB.', 413);
        }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const boundedRequest = new Request(request.url, {method: 'POST', headers: request.headers, body: Buffer.concat(chunks)});
    const form = await boundedRequest.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new ImportError('Nenhum arquivo enviado.');
    if (file.size > MAX_FILE_BYTES) throw new ImportError('Arquivo excede o limite de 5 MB.', 413);
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['csv', 'tsv', 'xls', 'xlsx', 'json'].includes(extension)) throw new ImportError('Formato não suportado. Use CSV, Excel ou JSON.');
    const records = readRecords(Buffer.from(await file.arrayBuffer()), extension);
    const leads: NonNullable<ReturnType<typeof normalizeLead>>[] = [];
    const seen = new Set<string>();
    let skipped = 0;
    let missingName = 0;
    let duplicates = 0;
    for (const record of records) {
      const lead = normalizeLead(record);
      if (!lead) { skipped++; missingName++; continue; }
      const identity = lead.phone_digits ? `phone:${lead.phone_digits}` : `company:${lead.nome.normalize('NFKC').toLocaleLowerCase('pt-BR')}|${lead.endereco?.normalize('NFKC').toLocaleLowerCase('pt-BR') || ''}|${lead.website?.toLowerCase() || ''}`;
      if (seen.has(identity)) { skipped++; duplicates++; continue; }
      seen.add(identity);
      leads.push(lead);
    }
    const warnings: string[] = [];
    if (missingName) warnings.push(`${missingName} linha(s) sem nome válido ignorada(s).`);
    if (duplicates) warnings.push(`${duplicates} duplicata(s) no lote ignorada(s).`);
    if (!leads.length) throw new ImportError('Nenhum lead válido encontrado. Informe o nome da empresa.');
    return NextResponse.json({success: true, preview: true, persisted: false, count: leads.length, newCount: leads.length, leads, skipped, warnings, message: 'Prévia validada. Nenhum lead foi salvo no CRM; duplicatas foram verificadas apenas neste lote.'}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    return NextResponse.json({success: false, preview: true, persisted: false, error: error instanceof ImportError ? error.message : 'Não foi possível ler o arquivo. Verifique o formato, os cabeçalhos e as linhas.'}, {status: error instanceof ImportError ? error.status : 400, headers: {'Cache-Control': 'no-store'}});
  }
}
