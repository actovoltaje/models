# Pulso Latente self-serve

Escáner gratuito que mide si ChatGPT, Gemini y Perplexity recomiendan una marca (índice Pulso Latente, 0–100) y, más adelante, suscripción mensual. Proyecto de Acto Voltaje; marca de producto: Latente.

- Especificación: doc «Pulso Latente self-serve · planteamiento» (https://claude.ai/artifact/JqbEGL6RQZuxGv7TRS6YtG).
- Plan vigente: `docs/plans/2026-10-26-mvp-escaner.md` (decisiones tomadas, restricciones globales, tareas).
- Notion: proyecto *AV · Latente*; siguiente paso de la cuenta: primer piloto pagado.

## Comandos

- `npm test` · `npm run test:cov` (umbral 80 % en `lib/`) · `npm run typecheck` · `npm run build` · `npm run dev`.
- Sin claves en `.env.local` el escáner usa motores simulados y la web lo avisa.

## Reglas del proyecto

- Dominio puro en `lib/pulso/` (sin red ni Next). Los motores son adaptadores intercambiables detrás de `Engine`.
- TDD: test primero, ver fallar, implementar. Código inmutable, archivos < 400 líneas, sin `console.log`.
- Marca y diseño: ver `docs/marca.md` y `/marca`. Un solo acento (cobalto), Geist, sin serif, tono de tienda sin siglas.
- Todo texto de marca vive en `lib/copy.ts`. Nombres canónicos: Latente, Pulso Latente, Acto Voltaje.
- Solo APIs oficiales de los motores; nunca automatizar apps de consumo.
- TypeScript fijado en 5.x (Next 15 no soporta TS 7). No subir sin subir Next.
- Los pesos de la nota (`WEIGHTS` en `lib/pulso/score.ts`) y los precios son hipótesis: se validan con los 20 primeros escaneos reales.
- Los límites de uso son en memoria por instancia: suficientes para validar, no para abrir al público en serio (fase 2: Supabase).

## Flujo con el toolkit (Everything Claude Code, copiado en `.claude/` del repo raíz)

1. `planner` / `/ecc-plan` para cualquier funcionalidad nueva; plan en `docs/plans/`.
2. `tdd-guide` + skill `tdd-workflow` al implementar.
3. `code-reviewer` justo después de escribir código; arreglar CRITICAL y HIGH.
4. `security-reviewer` antes de cada commit que toque `app/api/`, límites o datos personales.
5. Diseño: `emil-design-eng` y `review-animations` para pulir; `taste-skill` para validar que no parece plantilla de IA.
6. `verification-before-completion` antes de dar nada por terminado: tests, typecheck y build en verde.
