import { describe, expect, it } from "vitest";
import { signCard } from "@/lib/card-sig";
import { GET } from "./route";

const url = (score: string, brand: string, sig?: string) =>
  `score=${score}&brand=${encodeURIComponent(brand)}&sig=${sig ?? signCard(brand, Number(score))}`;
const get = (qs: string) => GET(new Request(`http://x/api/card?${qs}`));

describe("GET /api/card", () => {
  it("devuelve un SVG con la nota si la firma es válida", async () => {
    const res = await get(url("34", "clinicasol.es"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/svg+xml");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("content-security-policy")).toContain("default-src 'none'");
    const svg = await res.text();
    expect(svg).toContain("34");
    expect(svg).toContain("clinicasol.es");
  });
  it("403 si la firma no corresponde (nota o marca falsificadas)", async () => {
    const sig = signCard("clinicasol.es", 34);
    expect((await get(url("100", "clinicasol.es", sig))).status).toBe(403);
    expect((await get(url("34", "rival.es", sig))).status).toBe(403);
  });
  it("403 sin firma", async () => {
    expect((await get("score=34&brand=clinicasol.es")).status).toBe(403);
  });
  it("400 si la nota no es un entero 0-100", async () => {
    expect((await get(url("abc", "x.es", "00"))).status).toBe(400);
    expect((await get(url("101", "x.es", "00"))).status).toBe(400);
  });
  it("400 si la marca no es un dominio válido", async () => {
    const brand = "<script>alert(1)</script>";
    expect((await get(url("10", brand))).status).toBe(400);
    expect((await get("score=5&sig=00")).status).toBe(400);
  });
});
