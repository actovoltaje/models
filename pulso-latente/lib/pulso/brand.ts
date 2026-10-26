import { domainToASCII, domainToUnicode } from "node:url";

const SECOND_LEVEL = new Set(["co", "com", "org", "net", "gov", "ac"]);

/** Hosts donde la marca es el subdominio: clinicasol.wixsite.com → «clinicasol». */
const SUBDOMAIN_PLATFORMS = [
  "wixsite.com", "business.site", "github.io", "vercel.app", "netlify.app",
  "blogspot.com", "wordpress.com", "myshopify.com", "framer.website",
];

/** Redes y agregadores: no identifican un negocio, hay que pedir dominio propio. */
const BLOCKED_PLATFORMS = [
  "instagram.com", "facebook.com", "tiktok.com", "linktr.ee", "google.com", "youtube.com",
  "linkedin.com", "x.com", "twitter.com", "wa.me", "whatsapp.com",
];

const onHost = (domain: string, host: string): boolean => domain === host || domain.endsWith(`.${host}`);

/** Minúsculas y sin acentos, para comparar texto de forma estable. */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const compact = (s: string): string => fold(s).replace(/[^a-z0-9]/g, "");

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
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z0-9-]{2,}$/.test(host)) return null;
  return domainToUnicode(host) || host;
}

export function isSharedPlatform(domain: string): boolean {
  return BLOCKED_PLATFORMS.some((h) => onHost(domain, h));
}

export function brandAliasesFromDomain(domain: string): string[] {
  const platform = SUBDOMAIN_PLATFORMS.find((h) => domain.endsWith(`.${h}`));
  let label: string;
  if (platform) {
    label = domain.slice(0, -(platform.length + 1)).split(".").pop() ?? "";
  } else {
    const parts = domain.split(".");
    const secondLast = parts[parts.length - 2] ?? "";
    label = parts.length >= 3 && SECOND_LEVEL.has(secondLast) ? (parts[parts.length - 3] ?? "") : secondLast;
  }
  const aliases = [label, label.replace(/-/g, " ")].filter((a) => a.length >= 3);
  return [...new Set(aliases)];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWord(haystack: string, needle: string): boolean {
  return new RegExp(`(?<![a-z0-9])${escapeRegExp(needle)}(?![a-z0-9])`).test(haystack);
}

const CHUNK_SPLIT = /[.,;:!?()[\]{}"“”¿¡|*_#>/\\]+/;

/** True si palabras consecutivas de un mismo trozo, unidas, forman el alias («clinica sol» = «clinicasol»). */
function matchesAlias(block: string, alias: string): boolean {
  const target = compact(alias);
  if (!target) return false;
  for (const chunk of block.split(CHUNK_SPLIT)) {
    const words = chunk.split(/[^a-z0-9]+/).filter(Boolean);
    for (let i = 0; i < words.length; i += 1) {
      let acc = "";
      for (let j = i; j < words.length && acc.length < target.length; j += 1) {
        acc += words[j];
        if (acc === target) return true;
      }
    }
  }
  return false;
}

/** Índices (0 = primero) de los bloques no vacíos del texto donde aparece la marca o su dominio. */
export function findMentions(text: string, aliases: readonly string[], domain: string): number[] {
  const blocks = text.split(/\n+/).map(fold).filter((b) => b.trim().length > 0);
  const domains = domain ? [fold(domain), domainToASCII(domain)].filter(Boolean) : [];
  const hits: number[] = [];
  blocks.forEach((block, index) => {
    const byAlias = aliases.some((a) => matchesAlias(block, a));
    const byDomain = domains.some((d) => containsWord(block, d));
    if (byAlias || byDomain) hits.push(index);
  });
  return hits;
}

const TOP_LEVEL_ITEM = /^(?:\d+[.)]|[-*•])\s+/;

/** Elementos de lista de primer nivel (con su continuación con sangría). Lo demás es prosa. */
export function listItems(text: string): string[] {
  const items: string[] = [];
  let open = false;
  for (const line of text.split("\n")) {
    if (TOP_LEVEL_ITEM.test(line)) {
      items.push(line);
      open = true;
    } else if (open && /^\s+\S/.test(line)) {
      items[items.length - 1] += `\n${line}`;
    } else {
      open = false;
    }
  }
  return items;
}

/** Puesto (0 = primero) de la marca en la recomendación; null si no aparece. Prosa sin lista cuenta como 1. */
export function mentionPosition(text: string, aliases: readonly string[], domain: string): number | null {
  if (findMentions(text, aliases, domain).length === 0) return null;
  const items = listItems(text);
  if (items.length < 2) return 1;
  const at = items.findIndex((item) => findMentions(item, aliases, domain).length > 0);
  return at === -1 ? items.length : at;
}
