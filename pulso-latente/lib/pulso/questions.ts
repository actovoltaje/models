const TEMPLATES: readonly string[] = [
  "¿Cuál es el mejor {sector} en {city}?",
  "Recomiéndame un {sector} en {city}",
  "{sector} con buenas reseñas en {city}",
  "¿Cuánto cuesta un {sector} en {city}?",
  "¿Qué {sector} en {city} es más fiable?",
  "Mejores opciones de {sector} cerca de {city}",
  "¿A qué {sector} en {city} van los locales?",
  "Compara los {sector} de {city}",
  "Quiero contratar un {sector} en {city}, ¿por cuál empiezo?",
  "¿Qué {sector} de {city} tiene mejor relación calidad-precio?",
];

function titleCase(s: string): string {
  return s.replace(/(^|\s)(\p{L})/gu, (_, sp: string, ch: string) => sp + ch.toUpperCase());
}

export function buildQuestions(sector: string, city: string): string[] {
  const cleanSector = sector.trim().replace(/\s+/g, " ").toLowerCase();
  const cleanCity = titleCase(city.trim().replace(/\s+/g, " ").toLowerCase());
  if (!cleanSector || !cleanCity) throw new Error("sector y ciudad son obligatorios");
  return TEMPLATES.map((t) => t.replace(/\{sector\}/g, cleanSector).replace(/\{city\}/g, cleanCity));
}
