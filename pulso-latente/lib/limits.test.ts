import { describe, expect, it } from "vitest";
import { clientIp, createLimiter } from "./limits";

describe("createLimiter", () => {
  it("permite hasta max y bloquea el siguiente", () => {
    const l = createLimiter({ max: 3, windowMs: 1000 });
    expect([l.hit("a"), l.hit("a"), l.hit("a"), l.hit("a")]).toEqual([true, true, true, false]);
  });
  it("las claves son independientes", () => {
    const l = createLimiter({ max: 1, windowMs: 1000 });
    expect([l.hit("a"), l.hit("b")]).toEqual([true, true]);
  });
  it("libera al salir de la ventana", () => {
    let t = 0;
    const l = createLimiter({ max: 1, windowMs: 1000 }, () => t);
    l.hit("a");
    t = 1001;
    expect(l.hit("a")).toBe(true);
  });
});

describe("clientIp", () => {
  it("toma el primer valor de x-forwarded-for", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(req)).toBe("1.2.3.4");
  });
  it("devuelve unknown sin cabecera", () => {
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
