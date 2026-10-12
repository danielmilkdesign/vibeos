"use client";

import { useState } from "react";
import { Search, Download, Globe, Phone, MapPin, Loader2, Building2 } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  category: string;
  rating?: number | null;
  status: string;
}

export default function ProspeccaoPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Curitiba - PR");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  async function handleSearch() {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch("/api/prospecteezy/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location, limit: 20 }),
      });
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error("Erro na busca de leads:", err);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    if (!leads.length) return;
    const header = "Nome,Telefone,Site,Endereço\n";
    const rows = leads
      .map((l) => `"${l.name}","${l.phone || ""}","${l.website || ""}","${l.address || ""}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${query.replace(/\s+/g, "_")}.csv`;
    link.click();
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Prospecção Outbound</h1>
        <p className="text-muted-foreground text-sm">
          Motor Prospecteezy integrado: busca de empresas via Google Maps e qualificação para o Pipeline VIBE.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-xl border border-border">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Nicho / Segmento</label>
          <input
            type="text"
            placeholder="Ex: Clínicas odontológicas, Academias"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full mt-1 p-2 bg-background border border-border rounded-lg text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Cidade / Região</label>
          <input
            type="text"
            placeholder="Ex: Curitiba - PR, São Paulo - SP"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full mt-1 p-2 bg-background border border-border rounded-lg text-sm text-foreground"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={handleSearch}
            disabled={loading || !query}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground p-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar Leads
          </button>
          {leads.length > 0 && (
            <button
              onClick={exportToCSV}
              className="p-2 border border-border rounded-lg hover:bg-muted transition"
              title="Exportar CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {leads.length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <span className="text-sm font-semibold">{leads.length} leads encontrados</span>
            <span className="text-xs text-muted-foreground">Prontos para prospecção</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Empresa</th>
                  <th className="p-3">Telefone</th>
                  <th className="p-3">Website</th>
                  <th className="p-3">Endereço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/50 transition">
                    <td className="p-3 font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      {lead.name}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {lead.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          {lead.phone}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Link
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground max-w-xs truncate" title={lead.address || ""}>
                      {lead.address ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          {lead.address}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
