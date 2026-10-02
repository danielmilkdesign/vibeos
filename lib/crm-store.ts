import {
  Opportunity,
  Proposal,
  Project,
  Contract,
  Meeting,
  ComplianceCheck
} from '../types/crm';

// Clean initial data ready for real production inputs
export const INITIAL_OPPORTUNITIES: Opportunity[] = [];

export const INITIAL_PROPOSALS: Proposal[] = [];

export const INITIAL_PROJECTS_FULL: Project[] = [];

export const INITIAL_CONTRACTS: Contract[] = [];

export const INITIAL_MEETINGS: Meeting[] = [];

export const INITIAL_COMPLIANCE: ComplianceCheck[] = [];

// LocalStorage helpers with automatic purge of legacy mock records
export function getStoredData<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    // Purge legacy mock data once to give founders a fresh, clean real environment
    const isCleaned = localStorage.getItem('vibe_mock_cleaned_v2');
    if (!isCleaned) {
      const keysToClear = [
        'vibe_leads',
        'vibe_opps',
        'vibe_proposals',
        'vibe_projects',
        'vibe_contracts',
        'vibe_companies',
        'vibe_meetings',
        'vibe_compliance',
        'vibe_tasks',
        'vibe_deliverables',
        'vibe_clientes',
        'vibe_entregas'
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('vibe_mock_cleaned_v2', 'true');
      return defaultVal;
    }

    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

export function setStoredData<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage`, err);
  }
}

export function clearAllCrmData(): void {
  if (typeof window === 'undefined') return;
  const keysToClear = [
    'vibe_leads',
    'vibe_opps',
    'vibe_proposals',
    'vibe_projects',
    'vibe_contracts',
    'vibe_companies',
    'vibe_meetings',
    'vibe_compliance',
    'vibe_tasks',
    'vibe_deliverables',
    'vibe_clientes',
    'vibe_entregas'
  ];
  keysToClear.forEach((k) => localStorage.removeItem(k));
}
