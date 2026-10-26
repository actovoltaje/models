/** Versión del texto de consentimiento que ve la persona (ver lib/copy.ts). */
export const CONSENT_VERSION = "2026-10-v1";

export interface Lead {
  readonly email: string;
  readonly scanId: string;
  readonly createdAt: string;
  readonly consentAt: string;
  readonly consentVersion: string;
}

export interface LeadStore {
  save(lead: Lead): Promise<void>;
}

/** Almacén provisional en memoria. Fase 2: sustituir por Supabase sin tocar la ruta. */
export function createMemoryLeadStore(): LeadStore & { all(): readonly Lead[] } {
  const leads: Lead[] = [];
  return {
    async save(lead) {
      leads.push(lead);
    },
    all: () => [...leads],
  };
}
