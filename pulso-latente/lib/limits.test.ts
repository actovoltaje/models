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

describe("clientIp IPv6 y x-real-ip", () => {
  it("agrupa IPv6 por /64", () => {
    const a = clientIp(new Request("http://x", { headers: { "x-forwarded-for": "2a01:4f8:1:2:aaaa:bbbb:cccc:dddd" } }));
    const b = clientIp(new Request("http://x", { headers: { "x-forwarded-for": "2a01:4f8:1:2:1111:2222:3333:4444" } }));
    expect(a).toBe(b);
  });
  it("usa x-real-ip si no hay x-forwarded-for", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-real-ip": "7.7.7.7" } }))).toBe("7.7.7.7");
  });
});

describe("createLimiter memoria", () => {
  it("no crece más allá de maxKeys", () => {
    const l = createLimiter({ max: 1, windowMs: 1000, maxKeys: 3 });
    ["a", "b", "c", "d", "e"].forEach((k) => l.hit(k));
    expect(l.size()).toBeLessThanOrEqual(3);
  });
});
