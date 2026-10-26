import { verifyCard } from "@/lib/card-sig";
import { bandFor } from "@/lib/copy";
import { normalizeDomain } from "@/lib/pulso/brand";

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const status = (code: number) => new Response(code === 403 ? "forbidden" : "bad request", { status: code });

export async function GET(req: Request): Promise<Response> {
  const q = new URL(req.url).searchParams;
  const rawScore = q.get("score") ?? "";
  const brand = (q.get("brand") ?? "").trim();
  if (!/^\d{1,3}$/.test(rawScore) || Number(rawScore) > 100) return status(400);
  if (brand.length < 1 || brand.length > 60 || normalizeDomain(brand) !== brand) return status(400);
  const score = Number(rawScore);
  if (!verifyCard(brand, score, q.get("sig") ?? "")) return status(403);
  const circ = 2 * Math.PI * 120;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="Pulso Latente de ${esc(brand)}: ${score} sobre 100">
<rect width="1200" height="630" fill="#eef1f3"/>
<g transform="translate(250 315)">
<circle r="120" fill="none" stroke="#d3d9de" stroke-width="22"/>
<circle r="120" fill="none" stroke="#2a3fd1" stroke-width="22" stroke-linecap="round" stroke-dasharray="${((score / 100) * circ).toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90)"/>
<text y="32" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="96" fill="#101418">${score}</text>
</g>
<g font-family="system-ui, sans-serif" fill="#101418">
<g transform="translate(470 168) scale(.6)" fill="none" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
<path d="M12 88 L12 50 A38 38 0 0 1 50 12 A38 38 0 0 1 88 50 A38 38 0 0 1 50 88 Z" stroke="#101418"/>
<path d="M26 52 L38 52 L44 35 L54 69 L60 52 L74 52" stroke="#2a3fd1"/>
</g>
<text x="545" y="212" font-size="26" fill="#5a6470" letter-spacing="4">PULSO LATENTE</text>
<text x="470" y="330" font-size="56" font-weight="600">${esc(brand)}</text>
<text x="470" y="395" font-size="32" fill="#5a6470">${esc(bandFor(score))} en buscadores de IA</text>
<text x="470" y="520" font-size="26" fill="#5a6470">Mide el tuyo gratis. Latente, de Acto Voltaje.</text>
</g>
</svg>`;
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=86400",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
