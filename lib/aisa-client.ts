/** AIsa lifecycle wrapper. Quotes are estimates, never executed enrichment. */
export interface AisaConfig {
  apiKey: string;
  baseUrl?: string;
}
export class AisaClient {
  private apiKey: string;
  private baseUrl: string;
  constructor(config?: Partial<AisaConfig>) {
    this.apiKey = config?.apiKey || process.env.AISA_API_KEY || '';
    this.baseUrl = config?.baseUrl || 'https://tools.aisa.one/mcp';
  }
  private async call(path: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.apiKey) return {success: false, error: 'AIsa não configurada.'};
    try {
      const res = await fetch(`${this.baseUrl}/${path}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'AISA_API_KEY': this.apiKey, Authorization: `Bearer ${this.apiKey}`},
        body: JSON.stringify(payload), signal: AbortSignal.timeout(18000),
      });
      if (!res.ok) return {success: false, error: 'O provedor AIsa não concluiu a solicitação.'};
      const result: unknown = await res.json();
      if (!result || typeof result !== 'object' || Array.isArray(result)) return {success: false, error: 'Resposta inválida do provedor AIsa.'};
      return result as Record<string, unknown>;
    } catch { return {success: false, error: 'Não foi possível consultar o provedor AIsa.'}; }
  }
  async searchTool(query: string, domain?: string) { return this.call('search', {query, domain}); }
  async getSchema(toolName: string) { return this.call('schema', {tool_name: toolName}); }
  async quoteUsage(toolName: string, params: Record<string, unknown>) { return this.call('quote', {tool_name: toolName, params}); }
  async executeTool(toolName: string, params: Record<string, unknown>, quoteId?: string) { return this.call('use', {tool_name: toolName, params, quote_id: quoteId}); }
  async enrichLeadData(companyName: string, domainOrLink: string, city = 'Manaus') {
    const quotes = {
      dataforseo: await this.quoteUsage('dataforseo_maps', {keyword: `${companyName} ${city}`}),
      semrush: await this.quoteUsage('semrush_domain_rank', {domain: domainOrLink}),
      similarweb: await this.quoteUsage('similarweb_traffic', {domain: domainOrLink}),
      apollo: await this.quoteUsage('apollo_people_search', {company_name: companyName, location: city}),
    };
    return {status: Object.values(quotes).some(quote => quote.success !== true) ? 'QUOTE_FAILED' : 'QUOTED_NOT_EXECUTED', quotes, executed: false, metrics: null};
  }
}
