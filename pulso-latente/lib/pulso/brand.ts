const SECOND_LEVEL = new Set(["co", "com", "org", "net", "gov", "ac"]);

/** Minúsculas y sin acentos, para comparar texto de forma estable. */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function normalizeDomain(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^(javascript|data|file|ftp|mailto|vbscript):/i.test(raw)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!host.includes(".")) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) return null;
  if (/\.(local|internal|localhost|lan)$/.test(host)) return null;
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(host)) return null;
  return host;
}

export function brandAliasesFromDomain(domain: string): string[] {
  const parts = domain.split(".");
  const secondLast = parts[parts.length - 2] ?? "";
  const label =
    parts.length >= 3 && SECOND_LEVEL.has(secondLast) ? (parts[parts.length - 3] ?? "") : secondLast;
  const aliases = [label, label.replace(/-/g, " ")].filter((a) => a.length >= 3);
  return [...new Set(aliases)];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWord(haystack: string, needle: string): boolean {
  const re = new RegExp(`(?<![a-z0-9])${escapeRegExp(needle)}(?![a-z0-9])`);
  return re.test(haystack);
}

const compact = (s: string): string => fold(s).replace(/[^a-z0-9]/g, "");

/** True si palabras consecutivas del bloque, unidas, forman exactamente el alias («clinica sol» = «clinicasol»). */
function matchesAlias(block: string, alias: string): boolean {
  const target = compact(alias);
  if (!target) return false;
  const words = block.split(/[^a-z0-9]+/).filter(Boolean);
  for (let i = 0; i < words.length; i += 1) {
    let acc = "";
    for (let j = i; j < words.length && acc.length < target.length; j += 1) {
      acc += words[j];
      if (acc === target) return true;
    }
  }
  return false;
}

/** Índices (0 = primera) de los bloques no vacíos del texto donde aparece la marca o su dominio. */
export function findMentions(text: string, aliases: readonly string[], domain: string): number[] {
  const blocks = text.split(/\n+/).map(fold).filter((b) => b.trim().length > 0);
  const hits: number[] = [];
  blocks.forEach((block, index) => {
    const byAlias = aliases.some((a) => matchesAlias(block, a));
    const byDomain = domain.length > 0 && containsWord(block, fold(domain));
    if (byAlias || byDomain) hits.push(index);
  });
  return hits;
}
