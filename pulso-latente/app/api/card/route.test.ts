import { describe, expect, it } from "vitest";
import { GET } from "./route";

const get = (qs: string) => GET(new Request(`http://x/api/card?${qs}`));

describe("GET /api/card", () => {
  it("devuelve un SVG con la nota", async () => {
    const res = await get("score=34&brand=clinicasol.es");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/svg+xml");
    const svg = await res.text();
    expect(svg).toContain("34");
    expect(svg).toContain("clinicasol.es");
  });
  it("escapa la marca para evitar XSS", async () => {
    const svg = await (await get("score=10&brand=%3Cscript%3Ealert(1)%3C/script%3E")).text();
    expect(svg).not.toContain("<script");
    expect(svg).toContain("&lt;script");
  });
  it("400 si la nota no es un entero 0–100", async () => {
    expect((await get("score=abc&brand=x.es")).status).toBe(400);
    expect((await get("score=101&brand=x.es")).status).toBe(400);
  });
  it("400 si falta o es demasiado larga la marca", async () => {
    expect((await get("score=5")).status).toBe(400);
    expect((await get(`score=5&brand=${"a".repeat(80)}`)).status).toBe(400);
  });
});
