/**
 * AIsa API Client Wrapper - VIBE OS
 * Implementation of the 4-Step Lifecycle:
 * 1. SEARCH -> 2. SCHEMA -> 3. QUOTE -> 4. USE
 */

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

    if (!this.apiKey) {
      console.warn('[VIBE OS - AIsa Warning]: AISA_API_KEY not configured.');
    }
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'AISA_API_KEY': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Step 1: Search Tool
   */
  async searchTool(query: string, domain?: string) {
    try {
      const res = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ query, domain })
      });
      return await res.json();
    } catch (err) {
      console.error('[AIsa Search Error]:', err);
      return { success: false, error: String(err) };
    }
  }

  /**
   * Step 2: Get Schema
   */
  async getSchema(toolName: string) {
    try {
      const res = await fetch(`${this.baseUrl}/schema`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ tool_name: toolName })
      });
      return await res.json();
    } catch (err) {
      console.error('[AIsa Schema Error]:', err);
      return { success: false, error: String(err) };
    }
  }

  /**
   * Step 3: Quote Tool Usage
   */
  async quoteUsage(toolName: string, params: Record<string, any>) {
    try {
      const res = await fetch(`${this.baseUrl}/quote`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ tool_name: toolName, params })
      });
      return await res.json();
    } catch (err) {
      console.error('[AIsa Quote Error]:', err);
      return { success: false, error: String(err) };
    }
  }

  /**
   * Step 4: Execute Tool Usage
   */
  async executeTool(toolName: string, params: Record<string, any>, quoteId?: string) {
    try {
      const res = await fetch(`${this.baseUrl}/use`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ tool_name: toolName, params, quote_id: quoteId })
      });
      return await res.json();
    } catch (err) {
      console.error('[AIsa Execute Error]:', err);
      return { success: false, error: String(err) };
    }
  }

  /**
   * Helper: Enrich Lead via DataForSEO, Semrush, Similarweb, and Apollo
   */
  async enrichLeadData(companyName: string, domainOrLink: string, city = 'Manaus') {
    console.log(`[AIsa Growth Engine] Enriching data for ${companyName} (${city})...`);

    // 1. DataForSEO query
    const dataForSeoQuote = await this.quoteUsage('dataforseo_maps', { keyword: `${companyName} ${city}` });
    
    // 2. Semrush query
    const semrushQuote = await this.quoteUsage('semrush_domain_rank', { domain: domainOrLink });

    // 3. Similarweb query
    const similarwebQuote = await this.quoteUsage('similarweb_traffic', { domain: domainOrLink });

    // 4. Apollo query
    const apolloQuote = await this.quoteUsage('apollo_people_search', { company_name: companyName, location: city });

    return {
      status: 'QUOTED_AND_READY',
      quotes: {
        dataforseo: dataForSeoQuote,
        semrush: semrushQuote,
        similarweb: similarwebQuote,
        apollo: apolloQuote
      }
    };
  }
}
