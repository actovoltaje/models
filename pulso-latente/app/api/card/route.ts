import { bandFor } from "@/lib/copy";

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const bad = () => new Response("bad request", { status: 400 });

export async function GET(req: Request): Promise<Response> {
  const q = new URL(req.url).searchParams;
  const rawScore = q.get("score") ?? "";
  const brand = (q.get("brand") ?? "").trim();
  if (!/^\d{1,3}$/.test(rawScore) || Number(rawScore) > 100) return bad();
  if (brand.length < 1 || brand.length > 60) return bad();
  const score = Number(rawScore);
  const circ = 2 * Math.PI * 120;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="Pulso Latente de ${esc(brand)}: ${score} sobre 100">
<rect width="1200" height="630" fill="#f4efe6"/>
<g transform="translate(250 315)">
<circle r="120" fill="none" stroke="#d9d1c2" stroke-width="22"/>
<circle r="120" fill="none" stroke="#c8321e" stroke-width="22" stroke-linecap="round" stroke-dasharray="${((score / 100) * circ).toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90)"/>
<text y="30" text-anchor="middle" font-family="Georgia, serif" font-size="96" fill="#15130f">${score}</text>
</g>
<g font-family="Georgia, serif" fill="#15130f">
<text x="470" y="250" font-size="30" fill="#6b6457" font-family="system-ui, sans-serif" letter-spacing="3">PULSO LATENTE</text>
<text x="470" y="330" font-size="56">${esc(brand)}</text>
<text x="470" y="395" font-size="34" fill="#6b6457">${esc(bandFor(score))} en buscadores de IA</text>
<text x="470" y="520" font-size="26" fill="#6b6457" font-family="system-ui, sans-serif">Mide el tuyo gratis · Latente, de Acto Voltaje</text>
</g>
</svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=86400" } });
}
