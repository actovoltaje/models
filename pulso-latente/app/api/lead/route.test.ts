import { describe, expect, it } from "vitest";
import { POST } from "./route";

const call = (body: unknown, ip = "10.1.0.1") =>
  POST(
    new Request("http://x/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    }),
  );

const scanId = "3f2a1c9e-8a5b-4a6e-9c1d-2b7e4f5a6d70";

describe("POST /api/lead", () => {
  it("204 con email válido", async () => {
    expect((await call({ email: "lili@ejemplo.es", scanId })).status).toBe(204);
  });
  it("400 con email inválido", async () => {
    expect((await call({ email: "no-es-email", scanId })).status).toBe(400);
  });
  it("429 si repite el mismo email en 24 h", async () => {
    await call({ email: "dup@ejemplo.es", scanId }, "10.1.0.2");
    expect((await call({ email: "DUP@ejemplo.es", scanId }, "10.1.0.3")).status).toBe(429);
  });
});
