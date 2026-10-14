"use client";

import { useState, useMemo } from "react";
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
  Send
} from "lucide-react";

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
        setLeads(data.leads);
        if (data.leads.length === 0) {
          setErrorMsg("Nenhum resultado encontrado para essa busca. Tente alterar o nicho ou a cidade.");
        } else {
          showToast(`✓ ${data.leads.length} leads qualificados encontrados com sucesso!`);
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

  // Exportação CSV
  function exportToCSV(exportOnlySelected = false) {
    const targetLeads = exportOnlySelected
      ? leads.filter((l) => selectedIds.includes(l.id))
      : filteredLeads;

    if (!targetLeads.length) return;

    const header = "Nome,Categoria,Telefone,Website,Avaliacao,Endereco\n";
    const rows = targetLeads
      .map(
        (l) =>
          `"${(l.name || "").replace(/"/g, '""')}","${(l.category || "").replace(/"/g, '""')}","${l.phone || ""}","${l.website || ""}","${l.rating || ""}","${(l.address || "").replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${(query || "export").replace(/\s+/g, "_")}.csv`;
    link.click();
    showToast(`✓ Arquivo CSV exportado com ${targetLeads.length} leads.`);
  }

  // Copiar telefone com feedback
  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("Telefone copiado para a área de transferência!");
  }

  // Salvar Lead individual no CRM
  async function handleSaveToCRM(lead: Lead) {
    setSavingId(lead.id);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeEmpresa: lead.name,
          nicho: lead.category || "OUTBOUND",
          localizacao: lead.address || location,
          phoneWhatsapp: lead.phone,
          diagnosticoSeo: lead.website
            ? `Site existente: ${lead.website}`
            : "Sem website indexado (Alta oportunidade de fechamento)",
          valorEstimado: 2500,
        }),
      });

      if (res.ok) {
        setSavedIds((prev) => [...prev, lead.id]);
        showToast(`✓ "${lead.name}" importado para o Pipeline do CRM!`);
      } else {
        showToast("Erro ao importar lead no CRM.");
      }
    } catch {
      showToast("Erro de conexão ao salvar lead.");
    } finally {
      setSavingId(null);
    }
  }

  // Salvar múltiplos leads no CRM
  async function handleBulkSaveToCRM() {
    const toSave = leads.filter((l) => selectedIds.includes(l.id) && !savedIds.includes(l.id));
    if (!toSave.length) return;

    setSavingId("BULK");
    let count = 0;

    for (const lead of toSave) {
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nomeEmpresa: lead.name,
            nicho: lead.category || "OUTBOUND",
            localizacao: lead.address || location,
            phoneWhatsapp: lead.phone,
            diagnosticoSeo: lead.website
              ? `Site existente: ${lead.website}`
              : "Sem website indexado (Alta oportunidade de fechamento)",
            valorEstimado: 2500,
          }),
        });
        count++;
      } catch (err) {
        console.error("Erro ao salvar lote:", err);
      }
    }

    setSavedIds((prev) => [...prev, ...toSave.map((l) => l.id)]);
    setSavingId(null);
    showToast(`✓ ${count} leads importados para o Pipeline com sucesso!`);
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
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => exportToCSV(false)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/80 flex items-center gap-2 transition-all hover:border-slate-600 shadow-sm"
              title="Exportar todos os leads exibidos"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Exportar CSV ({filteredLeads.length})
            </button>
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

        {/* Sugestões Rápidas (Chips / Pills) */}
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
                <button
                  onClick={() => exportToCSV(true)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  Exportar
                </button>
                <button
                  onClick={handleBulkSaveToCRM}
                  disabled={savingId === "BULK"}
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
                    const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, "") : null;

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
                                  href={`https://wa.me/55${cleanPhone}`}
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
                            disabled={isSaved || savingId === lead.id}
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
              const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, "") : null;

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
                            href={`https://wa.me/55${cleanPhone}`}
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
                    disabled={isSaved || savingId === lead.id}
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
