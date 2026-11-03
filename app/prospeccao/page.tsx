"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Download,
  Globe,
  Phone,
  MapPin,
  Loader2,
  Building2,
  Star,
  Copy,
  Check,
  ExternalLink,
  Filter,
  Sparkles,
  Plus,
  CheckCircle2,
  UserPlus,
  AlertCircle,
  X,
  MessageSquare,
  ArrowUpRight,
  Send,
  ChevronDown,
  FileSpreadsheet,
  FileCode,
  FileText,
  Table,
  Upload
} from "lucide-react";

import { normalizePhone } from '../../lib/lead-normalization';
import { csvCell, clipboardCell } from '../../lib/lead-export';
import { analyzeLead } from '../../lib/lead-analysis';
import { saveProspects } from '../../lib/prospect-client';
import { refreshCrm, getStoredData, setStoredData } from '../../lib/crm-store';
import { prepareProspectProposals, type PreparedProspect } from '../../lib/prospect-proposals';
import { type ProposalDocument, proposalPending } from '../../lib/proposal-domain';
import ProposalAssets from '../../components/CRM/ProposalAssets';

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  category: string;
  rating?: number | null;
  ratingCount?: number | null;
  status: string;
}

const QUICK_SUGGESTIONS = [
  { label: "Personal Trainers • Curitiba", q: "Personal Trainer", loc: "Curitiba - PR" },
  { label: "Academias • Curitiba", q: "Academias de Ginástica", loc: "Curitiba - PR" },
  { label: "Dentistas • São Paulo", q: "Clínicas Odontológicas", loc: "São Paulo - SP" },
  { label: "Estética Facial • Rio", q: "Clínica de Estética Facial", loc: "Rio de Janeiro - RJ" },
  { label: "Advocacia • Florianópolis", q: "Escritórios de Advocacia", loc: "Florianópolis - SC" },
];

export default function ProspeccaoPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Curitiba - PR");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "WITH_PHONE" | "WITH_WEBSITE" | "NO_WEBSITE">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mainExportOpen, setMainExportOpen] = useState(false);
  const [bulkExportOpen, setBulkExportOpen] = useState(false);
  const [uploadedLeads, setUploadedLeads] = useState<Lead[]>([]);
  const [importedIds, setImportedIds] = useState<string[]>([]);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, ReturnType<typeof analyzeLead>>>({});
  const [prepared, setPrepared] = useState<PreparedProspect[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [prepareProgress, setPrepareProgress] = useState({ done: 0, total: 0 });
  const mainExportRef = useRef<HTMLDivElement>(null);
  const bulkExportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedRef = useRef<Lead[]>([]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mainExportRef.current && !mainExportRef.current.contains(e.target as Node)) {
        setMainExportOpen(false);
      }
      if (bulkExportRef.current && !bulkExportRef.current.contains(e.target as Node)) {
        setBulkExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  async function handleSearch(searchQuery?: string, searchLocation?: string) {
    const q = searchQuery !== undefined ? searchQuery : query;
    const loc = searchLocation !== undefined ? searchLocation : location;

    if (!q.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSelectedIds([]);

    try {
      const res = await fetch("/api/prospecteezy/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, location: loc }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao consultar motor de busca.");
      }

      if (data.leads) {
        // Preserve unsaved imported contacts across a new search.
        setLeads(Array.from(new Map([...uploadedRef.current, ...data.leads].map(l => [l.id, l] as const)).values()));
        if (data.leads.length === 0) {
          setErrorMsg(uploadedRef.current.length
            ? "Nenhum resultado novo nesta busca. Contatos importados foram preservados."
            : "Nenhum resultado encontrado para essa busca. Tente alterar o nicho ou a cidade.");
        } else {
          showToast(`${data.leads.length} contatos encontrados; qualificação pendente`);
        }
      }
    } catch (err: any) {
      console.error("Erro na busca de leads:", err);
      setErrorMsg(err.message || "Erro de conexão com a API da Serper.");
    } finally {
      setLoading(false);
    }
  }

  // Filtragem dinâmica
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (activeFilter === "WITH_PHONE") return !!l.phone;
      if (activeFilter === "WITH_WEBSITE") return !!l.website;
      if (activeFilter === "NO_WEBSITE") return !l.website;
      return true;
    });
  }, [leads, activeFilter]);

  // Contadores para as tabs
  const countWithPhone = useMemo(() => leads.filter((l) => !!l.phone).length, [leads]);
  const countWithWebsite = useMemo(() => leads.filter((l) => !!l.website).length, [leads]);
  const countNoWebsite = useMemo(() => leads.filter((l) => !l.website).length, [leads]);

  type ExportFormat = "csv_br" | "csv_intl" | "excel" | "json" | "txt_whatsapp" | "clipboard";

  function escapeHtml(str: string) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const EXPORT_FORMATS_CONFIG: {
    id: ExportFormat;
    title: string;
    ext: string;
    desc: string;
    icon: any;
    colorClass: string;
  }[] = [
    {
      id: "csv_br",
      title: "Excel / CSV Brasil",
      ext: ".csv",
      desc: "Separador ponto e vírgula (;), padrão nacional com acentos",
      icon: FileSpreadsheet,
      colorClass: "bg-emerald-950/60 border-emerald-800/50 text-emerald-400",
    },
    {
      id: "csv_intl",
      title: "Google Sheets / CSV Intl",
      ext: ".csv",
      desc: "Separador vírgula (,) para Google Sheets, Notion e CRMs",
      icon: Table,
      colorClass: "bg-cyan-950/60 border-cyan-800/50 text-cyan-400",
    },
    {
      id: "excel",
      title: "Planilha Excel Formatada",
      ext: ".xls",
      desc: "Tabela estilizada com cabeçalhos e células estruturadas",
      icon: FileSpreadsheet,
      colorClass: "bg-teal-950/60 border-teal-800/50 text-teal-400",
    },
    {
      id: "json",
      title: "Objeto JSON Estruturado",
      ext: ".json",
      desc: "Dados brutos completos com metadados para desenvolvedores",
      icon: FileCode,
      colorClass: "bg-purple-950/60 border-purple-800/50 text-purple-400",
    },
    {
      id: "txt_whatsapp",
      title: "Lista WhatsApp & SDR",
      ext: ".txt",
      desc: "Resumo executivo com contatos, links wa.me e lista limpa",
      icon: FileText,
      colorClass: "bg-amber-950/60 border-amber-800/50 text-amber-400",
    },
  ];

  function handleExport(format: ExportFormat, exportOnlySelected = false) {
    const targetLeads = exportOnlySelected
      ? leads.filter((l) => selectedIds.includes(l.id))
      : filteredLeads;

    if (!targetLeads.length) {
      showToast("Nenhum lead disponível para exportar.");
      return;
    }

    const fileSlug = (query || "leads")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "leads";

    const dateSlug = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    if (format === "csv_br") {
      const header = "Nome da Empresa;Categoria;Telefone;Website;Avaliação;Qtde Avaliações;Endereço\n";
      const rows = targetLeads
        .map((l) => [l.name, l.category, l.phone, l.website, l.rating, l.ratingCount, l.address].map(csvCell).join(";"))
        .join("\n");
      downloadFile(
        "\uFEFF" + header + rows,
        `leads-${fileSlug}-excel-br-${dateSlug}.csv`,
        "text/csv;charset=utf-8;"
      );
      showToast(`✓ CSV Brasil (;) exportado com ${targetLeads.length} leads.`);
    } else if (format === "csv_intl") {
      const header = "Company Name,Category,Phone,Website,Rating,Reviews Count,Address\n";
      const rows = targetLeads
        .map((l) => [l.name, l.category, l.phone, l.website, l.rating, l.ratingCount, l.address].map(csvCell).join(","))
        .join("\n");
      downloadFile(
        "\uFEFF" + header + rows,
        `leads-${fileSlug}-sheets-${dateSlug}.csv`,
        "text/csv;charset=utf-8;"
      );
      showToast(`✓ CSV Internacional (,) exportado com ${targetLeads.length} leads.`);
    } else if (format === "excel") {
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <style>
    th { background-color: #0891b2; color: #ffffff; font-weight: bold; border: 0.5pt solid #cbd5e1; padding: 8px; text-align: left; font-family: sans-serif; font-size: 11px; }
    td { border: 0.5pt solid #e2e8f0; padding: 6px; font-family: sans-serif; font-size: 11px; }
    .even { background-color: #f8fafc; }
  </style>
</head>
<body>
  <table>
    <thead>
      <tr>
        <th>Nome da Empresa</th>
        <th>Categoria</th>
        <th>Telefone / WhatsApp</th>
        <th>Website</th>
        <th>Avaliação</th>
        <th>Total Avaliações</th>
        <th>Endereço</th>
      </tr>
    </thead>
    <tbody>
      ${targetLeads
        .map(
          (l, idx) => `
        <tr class="${idx % 2 === 0 ? "even" : ""}">
          <td>${escapeHtml(l.name)}</td>
          <td>${escapeHtml(l.category)}</td>
          <td>${escapeHtml(l.phone || "")}</td>
          <td>${escapeHtml(l.website || "")}</td>
          <td>${l.rating || ""}</td>
          <td>${l.ratingCount || ""}</td>
          <td>${escapeHtml(l.address || "")}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;
      downloadFile(
        "\uFEFF" + html,
        `leads-${fileSlug}-${dateSlug}.xls`,
        "application/vnd.ms-excel;charset=utf-8;"
      );
      showToast(`✓ Planilha Excel (.xls) exportada com ${targetLeads.length} leads.`);
    } else if (format === "json") {
      const payload = {
        exportDate: new Date().toISOString(),
        nicheQuery: query || "Geral",
        location: location || "Brasil",
        totalLeads: targetLeads.length,
        leads: targetLeads.map((l) => ({
          id: l.id,
          name: l.name,
          category: l.category,
          phone: l.phone,
          website: l.website,
          rating: l.rating,
          ratingCount: l.ratingCount,
          address: l.address,
          status: l.status,
        })),
      };
      downloadFile(
        JSON.stringify(payload, null, 2),
        `leads-${fileSlug}-${dateSlug}.json`,
        "application/json;charset=utf-8;"
      );
      showToast(`✓ Arquivo JSON exportado com ${targetLeads.length} leads.`);
    } else if (format === "txt_whatsapp") {
      const dateStr = new Date().toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const cleanNumbers = targetLeads
        .map((l) => (l.phone ? l.phone.replace(/\D/g, "") : null))
        .filter(Boolean);

      let txt = `====================================================================\n`;
      txt += `VIBE OS • LISTA DE PROSPECÇÃO OUTBOUND & SDR\n`;
      txt += `Nicho / Busca: ${query || "Todos"}\n`;
      txt += `Região: ${location || "Não especificada"}\n`;
      txt += `Total de Leads: ${targetLeads.length}\n`;
      txt += `Data da Extração: ${dateStr}\n`;
      txt += `====================================================================\n\n`;

      targetLeads.forEach((l, i) => {
        const clean = normalizePhone(l.phone);
        txt += `[${i + 1}] ${l.name.toUpperCase()}\n`;
        txt += `    • Telefone: ${l.phone || "Sem telefone cadastrado"}\n`;
        txt += `    • WhatsApp Link: ${clean ? `https://wa.me/${clean}` : "N/A"}\n`;
        txt += `    • Website: ${l.website || "Sem website indexado (Oportunidade)"}\n`;
        txt += `    • Categoria: ${l.category}\n`;
        if (l.rating) txt += `    • Avaliação: ${l.rating} ⭐ (${l.ratingCount || 0} avaliações)\n`;
        if (l.address) txt += `    • Endereço: ${l.address}\n`;
        txt += `--------------------------------------------------------------------\n`;
      });

      if (cleanNumbers.length > 0) {
        txt += `\n\n====================================================================\n`;
        txt += `LISTA RÁPIDA DE WHATSAPP / TELEFONES (${cleanNumbers.length} NÚMEROS):\n`;
        txt += `====================================================================\n`;
        cleanNumbers.forEach((n) => {
          txt += `${n}\n`;
        });
      }

      downloadFile(
        txt,
        `leads-${fileSlug}-whatsapp-${dateSlug}.txt`,
        "text/plain;charset=utf-8;"
      );
      showToast(`✓ Lista WhatsApp / TXT exportada com ${targetLeads.length} contatos.`);
    } else if (format === "clipboard") {
      const header = "Nome\tCategoria\tTelefone\tWebsite\tAvaliação\tTotal Avaliações\tEndereço\n";
      const rows = targetLeads
        .map((l) => [l.name, l.category, l.phone, l.website, l.rating, l.ratingCount, l.address].map(clipboardCell).join("\t"))
        .join("\n");
      navigator.clipboard.writeText(header + rows);
      showToast(`✓ ${targetLeads.length} leads copiados como tabela! Cole no Excel ou Sheets (Ctrl+V).`);
    }
  }

  function renderExportMenu(isBulk: boolean, onClose: () => void) {
    const count = isBulk ? selectedIds.length : filteredLeads.length;
    return (
      <div className="absolute right-0 mt-2 w-80 bg-[#0A0F1D] border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800/80 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Download className="w-3 h-3 text-cyan-400" />
            Formatos de Exportação
          </span>
          <span className="text-cyan-400 font-mono font-semibold">{count} lead{count > 1 ? "s" : ""}</span>
        </div>

        <div className="space-y-0.5">
          {EXPORT_FORMATS_CONFIG.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  handleExport(opt.id, isBulk);
                  onClose();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 group cursor-pointer"
              >
                <div className={`p-1.5 rounded-lg border shrink-0 group-hover:scale-105 transition-transform ${opt.colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-100 flex items-center justify-between">
                    <span>{opt.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white/[0.04] text-slate-400 border border-white/[0.06] rounded">
                      {opt.ext}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-800/80 mt-1.5 pt-1.5">
          <button
            onClick={() => {
              handleExport("clipboard", isBulk);
              onClose();
            }}
            className="w-full text-left p-2 rounded-xl hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>Copiar Tabela (Colar no Excel/Sheets)</span>
          </button>
        </div>
      </div>
    );
  }

  // Copiar telefone com feedback
  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("Telefone copiado para a área de transferência!");
  }

  // Confirma lead e oportunidade persistidos antes de marcar No CRM.
  async function handleSaveToCRM(lead: Lead) {
    setSavingId(lead.id);
    try {
      const result = await saveProspects([{...lead,analysis:analyzeLead({...lead,nomeEmpresa:lead.name,phoneWhatsapp:lead.phone,localizacao:lead.address || location})}]);
      if (result.failures.length) throw new Error(result.failures[0].message);
      setSavedIds(prev => Array.from(new Set([...prev,...result.savedIds])));
      await refreshCrm();
      showToast(`✓ "${lead.name}" salvo no CRM e disponível no Pipeline.`);
    } catch(error) { setErrorMsg(error instanceof Error ? error.message : 'Falha ao salvar contato.'); }
    finally {setSavingId(null);}
  }

  async function handleBulkSaveToCRM() {
    const toSave = leads.filter(l => selectedIds.includes(l.id) && !savedIds.includes(l.id));
    if (!toSave.length) return;
    setSavingId('BULK');
    try {
      const result = await saveProspects(toSave.map(lead => ({...lead,analysis:analyzeLead({...lead,nomeEmpresa:lead.name,phoneWhatsapp:lead.phone,localizacao:lead.address || location})})));
      setSavedIds(prev => Array.from(new Set([...prev,...result.savedIds])));
      if (result.savedIds.length) await refreshCrm();
      showToast(`${result.savedIds.length} contatos gravados; ${result.failures.length} falhas disponíveis para nova tentativa.`);
      if(result.failures.length) setErrorMsg(result.failures.map(f => f.message).join(' · '));
    } catch(error) {setErrorMsg(error instanceof Error ? error.message : 'Não foi possível atualizar o CRM.');}
    finally {setSavingId(null);}
  }

  async function handlePrepareProposals() {
    if (preparing || savingId) return;
    const selected = leads.filter(lead => selectedIds.includes(lead.id));
    if (!selected.length) return;
    setPreparing(true);
    setErrorMsg(null);
    setPrepared([]);
    setPrepareProgress({ done: 0, total: selected.length });
    const input = selected.map(lead => ({ ...lead, analysis: analyzeLead({ ...lead, nomeEmpresa: lead.name, phoneWhatsapp: lead.phone }) }));
    setAnalyses(Object.fromEntries(input.map(lead => [lead.id, lead.analysis])));
    try {
      const result = await prepareProspectProposals(input, {
        save: saveProspects,
        read: async () => { await refreshCrm(); return getStoredData<ProposalDocument[]>('vibe_proposals', []); },
        write: async proposals => { await setStoredData('vibe_proposals', proposals); },
      }, (done, total) => setPrepareProgress({ done, total }));
      setSavedIds(prev => Array.from(new Set([...prev, ...result.savedIds])));
      setPrepared(result.prepared);
      if (result.failures.length) setErrorMsg(result.failures.map(failure => failure.message).join(' · '));
      showToast(`${result.prepared.length} contatos preparados; ${result.createdCount} novos rascunhos salvos; ${result.failures.length} falhas. Revise preços e termos em Propostas.`);
    } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Falha ao preparar propostas.'); }
    finally { setPreparing(false); }
  }

  // Importar leads de arquivo (CSV / Excel / JSON)
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    await processLeadFile(event.target.files?.[0]);
  }

  async function processLeadFile(file?: File) {
    if (!file) return;

    if (!file.type && !['.csv', '.xls', '.xlsx', '.json'].some(ext => file.name.toLowerCase().endsWith(ext))) {
      setFileError('Formato não reconhecido. Use CSV, Excel (.xls/.xlsx) ou JSON.');
      return;
    }

    setFileUploading(true);
    setFileError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao importar arquivo.');
      }

      if (data.leads && data.leads.length > 0) {
        // Map the imported leads to the expected Lead interface format
        const mappedLeads = data.leads.map((l: any, i: number) => ({
          id: l.externalId || l.id || `lead-file-${Date.now()}-${i}`,
          name: l.nome || l.name || '',
          phone: l.phone || null,
          address: l.endereco || l.address || null,
          website: l.website || l.site || l.link || null,
          category: l.categoria || l.nicho || l.category || 'OUTBOUND',
          rating: l.rating ? parseFloat(l.rating) || null : null,
          ratingCount: l.ratingCount ?? l.rating_count ?? null,
          status: l.status || 'Novo',
        }));

        // Add to main leads list so they appear in the table, deduping by stable id.
        const deduped = Array.from(new Map([...mappedLeads, ...uploadedRef.current].map(l => [l.id, l] as const)).values());
        uploadedRef.current = deduped;
        setLeads((prev) => Array.from(new Map([...deduped, ...prev].map(l => [l.id, l] as const)).values()));
        setUploadedLeads(mappedLeads);
        setImportedIds(deduped.map(l => l.id));
        showToast(`${data.count} contatos na prévia. Selecione e salve no CRM para persistir.${data.skipped ? ` ${data.skipped} linhas ignoradas.` : ''}`);
      } else {
        setFileError('Nenhum lead encontrado no arquivo.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setFileError(err instanceof Error ? err.message : 'Erro ao processar o arquivo.');
    } finally {
      setFileUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // Toggle seleção de leads
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-slate-100 px-4 py-3 rounded-xl shadow-2xl shadow-cyan-950/60 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header com Design System VIBE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-[11px] font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Motor Outbound Prospecteezy • Serper Places API
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <Send className="w-7 h-7 text-cyan-400" />
            Prospecção Outbound & Captura de Leads
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl">
            Busca ativa de empresas locais em tempo real no Google Maps com enriquecimento de dados,
            validação de presença digital e importação direta para o Pipeline VIBE.
          </p>
        </div>

        {leads.length > 0 && (
          <div className="relative self-start md:self-auto" ref={mainExportRef}>
            <button
              onClick={() => setMainExportOpen((prev) => !prev)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/80 flex items-center gap-2 transition-all hover:border-slate-600 shadow-sm cursor-pointer"
              title="Exportar todos os leads exibidos em múltiplos formatos"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Exportar Resultados ({filteredLeads.length})</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  mainExportOpen ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </button>
            {mainExportOpen && renderExportMenu(false, () => setMainExportOpen(false))}
          </div>
        )}
      </div>

      {/* Card da Barra de Busca Redesenhada com Alto Contraste */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-3"
        >
          {/* Input Nicho / Segmento */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              Nicho / Segmento de Mercado
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Personal Trainer, Clínicas odontológicas"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Input Cidade / Região */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Cidade & UF
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Curitiba - PR, São Paulo - SP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Botão de Busca */}
          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full h-[42px] flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Buscando Leads...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-slate-950" />
                  Buscar Leads
                </>
              )}
            </button>
          </div>
        </form>

        {/* SUGESTÕES RÁPIDAS (Chips / Pills) */}
        <div className="pt-1 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Sugestões Rápidas:
          </span>
          {QUICK_SUGGESTIONS.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setQuery(item.q);
                setLocation(item.loc);
                handleSearch(item.q, item.loc);
              }}
              className="text-xs bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 px-2.5 py-1 rounded-lg transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4" aria-label="Análise comercial dos contatos">
        <h2 className="text-lg font-semibold text-white">Análise e próximos passos</h2>
        <p className="text-sm text-slate-400">A análise usa os dados coletados, sem inventar métricas de SEO, tráfego ou retorno. Recomendações são hipóteses para validar com o cliente.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={!selectedIds.length || preparing || !!savingId} onClick={handlePrepareProposals} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-cyan-300">{preparing ? `Preparando ${prepareProgress.done}/${prepareProgress.total}…` : `Preparar propostas (${selectedIds.length})`}</button>
          <a href="/pipeline" className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 focus-visible:ring-2 focus-visible:ring-cyan-300">Abrir Pipeline</a>
          <a href="/propostas" className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 focus-visible:ring-2 focus-visible:ring-cyan-300">Revisar propostas e preparar WhatsApp</a>
        </div>
        <p className="text-xs text-slate-400">Preparar salva os contatos no CRM e cria rascunhos com conceitos visuais. Não acessa redes sociais nem comprova a identidade da marca ou a existência de automação. Nenhuma mensagem é enviada.</p>
        {preparing && <p role="status" className="text-sm text-cyan-300">Processando {prepareProgress.done} de {prepareProgress.total} contatos. Mantenha esta página aberta.</p>}
        {Object.entries(analyses).map(([id,analysis])=><details key={id} className="rounded-lg border border-slate-800 p-3"><summary className="text-slate-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-300">{leads.find(lead=>lead.id===id)?.name || 'Contato'} — fatos, hipóteses e recomendações</summary><pre className="whitespace-pre-wrap break-words text-xs text-slate-300 mt-3">{JSON.stringify(analysis,null,2)}</pre></details>)}
        {prepared.map(item => <details key={item.lead.id} className="border border-slate-700 rounded-xl p-4 space-y-3">
          <summary className="cursor-pointer text-slate-100 font-medium">{item.lead.nomeEmpresa} — {item.proposals.length} propostas no CRM</summary>
          <a className="inline-block text-cyan-300 underline" href={`/propostas?leadId=${encodeURIComponent(item.lead.id)}&opportunityId=${encodeURIComponent(item.opportunityId)}`}>Revisar textos, termos e imagens deste contato</a>
          {item.proposals.map(proposal => <div key={proposal.id} className="border-t border-slate-800 pt-4 space-y-3"><h3 className="text-slate-100">{proposal.offerTitle}</h3><ProposalAssets proposal={proposal} canExport={!!proposal.internalApprovedAt && proposalPending(proposal).length === 0}/></div>)}
        </details>)}
      </section>

      {/* UPLOAD DE ARQUIVOS DE LEADS (CSV / EXCEL / JSON) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100">Importar Lista de Leads</h3>
          <span className="text-[10px] font-mono text-slate-400 ml-auto">CSV • Excel • JSON</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Envie um arquivo CSV (sendo que o uso de alta qualidade em formatos brasileiros) ou
          Excel exportado pelo motor Prospecteezy. O sistema permite a importação contínua de
          leads organizados em colunas com os seguintes cabeçalhos:
          <strong>Nome, Telefone, Website, Categoria, Avaliação, Endereço</strong>.
          Os dados serão listados na prévia abaixo. O salvamento no CRM é uma etapa separada.
        </p>

        <label onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault(); if(!fileUploading) void processLeadFile(event.dataTransfer.files[0]);}} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-cyan-500/60 transition-all group bg-slate-950/40">
          <div className="flex flex-col items-center justify-center pt-5 pb-4">
            <Upload className="w-7 h-7 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <p className="mt-2 text-xs text-slate-300 font-medium">
              Clique para selecionar ou arraste o arquivo
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Arquivos suportados: <code className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">.csv</code>, <code className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">.xlsx</code>, <code className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">.json</code>
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            id="leadUpload"
            aria-label="Selecionar lista de contatos para pré-visualização"
            disabled={fileUploading}
            className="sr-only"
            accept=".csv,.xls,.xlsx,.json"
            onChange={handleFileUpload}
          />
        </label>

        {fileError && (
          <div className="mt-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {uploadedLeads.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-mono">Importados: {uploadedLeads.length} leads</span>
              <button
                onClick={() => { setUploadedLeads([]); setImportedIds([]); setFileError(null); }}
                className="text-slate-500 hover:text-slate-300 text-[10px] underline underline-offset-2"
              >
                Limpar
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {uploadedLeads.slice(0, 8).map((l, i) => (
                <span key={i} className="text-[10px] bg-slate-950/80 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                  {l.name || 'sem-nome'}
                </span>
              ))}
              {uploadedLeads.length > 8 && (
                <span className="text-[10px] text-slate-500">+{uploadedLeads.length - 8} mais</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mensagem de Erro se houver */}
      {errorMsg && (
        <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="h-5 bg-slate-800 rounded w-48 animate-pulse" />
            <div className="h-5 bg-slate-800 rounded w-24 animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between animate-pulse"
              >
                <div className="space-y-2 w-1/3">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                </div>
                <div className="h-4 bg-slate-800 rounded w-1/5" />
                <div className="h-4 bg-slate-800 rounded w-1/5" />
                <div className="h-8 bg-slate-800 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados de Prospecção */}
      {!loading && leads.length > 0 && (
        <div className="space-y-4">
          {/* Barra de Filtros e Ações em Lote */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setActiveFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === "ALL"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                Todos ({leads.length})
              </button>
              <button
                onClick={() => setActiveFilter("WITH_PHONE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === "WITH_PHONE"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                Com Telefone ({countWithPhone})
              </button>
              <button
                onClick={() => setActiveFilter("WITH_WEBSITE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === "WITH_WEBSITE"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Globe className="w-3 h-3 text-cyan-400" />
                Com Website ({countWithWebsite})
              </button>
              <button
                onClick={() => setActiveFilter("NO_WEBSITE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === "NO_WEBSITE"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <AlertCircle className="w-3 h-3 text-amber-400" />
                Sem Website ({countNoWebsite})
              </button>
            </div>

            {/* Ações em Lote */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-slate-300 font-medium">
                  {selectedIds.length} selecionado{selectedIds.length > 1 ? "s" : ""}
                </span>
                <div className="relative" ref={bulkExportRef}>
                  <button
                    onClick={() => setBulkExportOpen((prev) => !prev)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Exportar leads selecionados em múltiplos formatos"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Exportar ({selectedIds.length})</span>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                        bulkExportOpen ? "rotate-180 text-cyan-400" : ""
                      }`}
                    />
                  </button>
                  {bulkExportOpen && renderExportMenu(true, () => setBulkExportOpen(false))}
                </div>
                <button
                  onClick={handleBulkSaveToCRM}
                  disabled={!!savingId || preparing}
                  className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {savingId === "BULK" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  Importar para o CRM
                </button>
              </div>
            )}
          </div>

          {/* VISUALIZAÇÃO DESKTOP: TABELA COMPLETA */}
          <div className="hidden md:block border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/90 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-[11px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredLeads.length > 0 &&
                          selectedIds.length === filteredLeads.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">Empresa & Categoria</th>
                    <th className="p-3.5">Telefone / WhatsApp</th>
                    <th className="p-3.5">Presença Digital</th>
                    <th className="p-3.5">Endereço</th>
                    <th className="p-3.5 text-right">Ação Comercial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredLeads.map((lead) => {
                    const isSelected = selectedIds.includes(lead.id);
                    const isSaved = savedIds.includes(lead.id);
                    const cleanPhone = normalizePhone(lead.phone);

                    return (
                      <tr
                        key={lead.id}
                        className={`transition-colors ${
                          isSelected ? "bg-cyan-950/20" : "hover:bg-slate-800/40"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(lead.id)}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                          />
                        </td>

                        {/* Empresa & Rating */}
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span className="truncate max-w-xs">{lead.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {lead.category}
                            </span>
                            {lead.rating && (
                              <span className="text-[11px] text-amber-300 flex items-center gap-1 font-mono">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {lead.rating.toFixed(1)}
                                {lead.ratingCount && (
                                  <span className="text-slate-500">({lead.ratingCount})</span>
                                )}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Telefone */}
                        <td className="p-3.5">
                          {lead.phone ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-emerald-400">
                                {lead.phone}
                              </span>
                              <button
                                onClick={() => copyToClipboard(lead.phone!, lead.id)}
                                className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition"
                                title="Copiar telefone"
                              >
                                {copiedId === lead.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-emerald-400 hover:text-emerald-300 rounded hover:bg-emerald-950/60 transition"
                                  title="Iniciar conversa no WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Não disponível</span>
                          )}
                        </td>

                        {/* Website */}
                        <td className="p-3.5">
                          {lead.website ? (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline max-w-[160px] truncate"
                              title={lead.website}
                            >
                              <Globe className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                {lead.website.replace(/^https?:\/\/(www\.)?/, "")}
                              </span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full font-medium">
                              Sem website
                            </span>
                          )}
                        </td>

                        {/* Endereço */}
                        <td className="p-3.5 max-w-xs">
                          {lead.address ? (
                            <div
                              className="text-xs text-slate-400 truncate flex items-center gap-1.5"
                              title={lead.address}
                            >
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{lead.address}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                        </td>

                        {/* Ação: Salvar no CRM */}
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleSaveToCRM(lead)}
                            disabled={isSaved || !!savingId || preparing}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                              isSaved
                                ? "bg-emerald-950/80 border border-emerald-800 text-emerald-400 cursor-default"
                                : "bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500"
                            }`}
                          >
                            {savingId === lead.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isSaved ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                No CRM
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                                Salvar CRM
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* VISUALIZAÇÃO MOBILE & TABLET: CARDS RESPONSIVOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
            {filteredLeads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);
              const isSaved = savedIds.includes(lead.id);
              const cleanPhone = normalizePhone(lead.phone);

              return (
                <div
                  key={lead.id}
                  className={`bg-slate-900 border rounded-2xl p-4 space-y-3 transition-all ${
                    isSelected ? "border-cyan-500/80 bg-slate-900/90" : "border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-100 text-sm leading-tight">
                        {lead.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {lead.category}
                        </span>
                        {lead.rating && (
                          <span className="text-[10px] text-amber-300 flex items-center gap-1 font-mono">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {lead.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(lead.id)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer w-4 h-4"
                    />
                  </div>

                  {lead.address && (
                    <div className="text-xs text-slate-400 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{lead.address}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    {/* Canal de Contato */}
                    {lead.phone ? (
                      <div className="flex items-center gap-1.5">
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded-lg"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="text-xs font-mono text-emerald-400">{lead.phone}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Sem telefone</span>
                    )}

                    {/* Website */}
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Visitar
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded">
                        Sem site
                      </span>
                    )}
                  </div>

                  {/* Ação Salvar */}
                  <button
                    onClick={() => handleSaveToCRM(lead)}
                    disabled={isSaved || !!savingId || preparing}
                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isSaved
                        ? "bg-emerald-950/80 border border-emerald-800 text-emerald-400"
                        : "bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700"
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Importado no Pipeline
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Importar para CRM
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State Inicial quando ainda não buscou */}
      {!loading && leads.length === 0 && !errorMsg && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center mx-auto text-cyan-400 shadow-xl shadow-cyan-950/50">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-100">
              Pronto para prospecção outbound de alta precisão
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              O motor Prospecteezy vasculha o Google Maps para localizar empresas do seu nicho alvo,
              identificar se possuem website e fornecer contatos diretos para seu time comercial.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left pt-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-cyan-400 font-bold text-xs">1. Pesquisa Ativa</span>
              <p className="text-xs text-slate-400">
                Localize centenas de estabelecimentos qualificados por região.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-emerald-400 font-bold text-xs">2. WhatsApp Direto</span>
              <p className="text-xs text-slate-400">
                Inicie abordagens no WhatsApp com um único clique.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-purple-400 font-bold text-xs">3. Pipeline Sync</span>
              <p className="text-xs text-slate-400">
                Importe leads diretamente para o Kanban comercial do VIBE OS.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
