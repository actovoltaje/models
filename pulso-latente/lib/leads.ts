export interface Lead {
  readonly email: string;
  readonly scanId: string;
  readonly createdAt: string;
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
