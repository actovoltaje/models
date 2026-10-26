import { describe, expect, it } from "vitest";
import { POST } from "./route";

const call = (body: unknown, ip: string, raw = false) =>
  POST(
    new Request("http://x/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: raw ? (body as string) : JSON.stringify(body),
    }),
  );

const ok = { url: "clinicasol.es", sector: "clínica de fisioterapia", city: "Granada" };

describe("POST /api/scan", () => {
  it("200 con resultado y scanId", async () => {
    const res = await call(ok, "10.0.0.1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.score).toBeGreaterThanOrEqual(0);
    expect(json.advice).toHaveLength(3);
    expect(typeof json.scanId).toBe("string");
    expect(json.simulated).toBe(true);
  });
  it("400 con JSON roto", async () => {
    expect((await call("{no", "10.0.0.2", true)).status).toBe(400);
  });
  it("400 con URL inválida, sin detalles internos", async () => {
    const res = await call({ ...ok, url: "javascript:alert(1)" }, "10.0.0.3");
    expect(res.status).toBe(400);
    expect(JSON.stringify(await res.json())).not.toMatch(/stack|zod|at /i);
  });
  it("400 con sector demasiado corto o largo", async () => {
    expect((await call({ ...ok, sector: "a" }, "10.0.0.4")).status).toBe(400);
    expect((await call({ ...ok, sector: "x".repeat(61) }, "10.0.0.5")).status).toBe(400);
  });
  it("429 al cuarto escaneo desde la misma IP", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 4; i += 1) statuses.push((await call(ok, "10.0.0.9")).status);
    expect(statuses).toEqual([200, 200, 200, 429]);
  });
});
