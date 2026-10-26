# Pulso Latente self-serve · MVP del escáner · Plan de implementación

> **Para quien ejecute:** usar superpowers:subagent-driven-development o superpowers:executing-plans. Los pasos usan casillas `- [ ]`.

**Objetivo:** un escáner gratuito que, dadas URL, sector y ciudad, pregunta a ChatGPT, Gemini y Perplexity como lo haría un comprador y devuelve el Pulso Latente (0–100), los 3 competidores que más aparecen y 3 acciones.

**Arquitectura:** Next.js (App Router) en Vercel. La lógica de dominio (`lib/pulso`) es TypeScript puro y testeable, sin red. Cada motor es un adaptador intercambiable detrás de una interfaz; sin claves de API se usa un motor simulado, de modo que el producto se puede enseñar y testear desde el día uno. Persistencia (Supabase), pagos (Stripe) y email (Resend) quedan tras interfaces y se activan en la fase 2 del roadmap.

**Stack:** Next.js 15, React 19, TypeScript estricto, zod, Vitest. CSS propio (sin framework de UI) para controlar el diseño.

**Especificación:** doc «Pulso Latente self-serve · planteamiento» (https://claude.ai/artifact/JqbEGL6RQZuxGv7TRS6YtG). Notion: proyecto *AV · Latente* (siguiente paso: primer piloto pagado).

## Decisiones tomadas (las «pendientes» del doc, con la recomendación del propio doc)

| Decisión pendiente | Elegida | Reversible |
|---|---|---|
| Marca | Latente; el plan self-serve se llama «Pulso» | sí, copy en un único archivo |
| Construcción | Nivel recomendado (código), arrancando solo con el escáner | sí |
| Sector piloto | Sin sector fijo en código; ejemplos de cosmética/estética y comercio local en Granada | sí |
| Descuento fundador / precio Agencia | Fuera del MVP: la web muestra 149 €/mes y no se cobra aún | sí |

## Restricciones globales

- Escáner gratuito: 1 marca, 10 preguntas, 3 motores, una vez.
- Entrada mínima: URL, sector y ciudad. Sin cuenta; el email solo para recibir el informe completo.
- Solo APIs oficiales de los motores; nunca automatizar apps de consumo.
- Cada pregunta se repite 2–3 veces y la nota se muestra como media con margen.
- La web dice que la nota mide una tendencia, no la pantalla de cada usuario, y es orientativa.
- Límite por email y por IP (el gratuito cuesta 0,20–0,60 €/escaneo).
- Un motor que falla no tumba el escaneo: se devuelve resultado parcial.
- Nombres canónicos en copy: «Latente», «Pulso Latente», «Acto Voltaje».
- Código inmutable, archivos < 400 líneas, sin `console.log`, cobertura ≥ 80 % en `lib/`.

## Review Focus

1. URL pegada sin protocolo, con `www.`, ruta o mayúsculas → se normaliza al mismo dominio. (Tarea 2)
2. Marca con nombre parecido a otra (p. ej. «Pulso» dentro de «Impulso») → no cuenta como mención. (Tarea 2)
3. Un motor devuelve error o vacío → resultado parcial, nota calculada solo con lo que respondió. (Tarea 5)
4. Todos los motores fallan → error claro, sin nota inventada. (Tarea 5)
5. Abuso del gratuito: ráfaga de peticiones desde una IP o repetición con el mismo email. (Tarea 6)

## Estructura de archivos

- `lib/pulso/types.ts` — tipos compartidos.
- `lib/pulso/brand.ts` — normalización de URL y detección de marca en texto.
- `lib/pulso/score.ts` — puntuación por respuesta y Pulso agregado.
- `lib/pulso/questions.ts` — preguntas de comprador.
- `lib/pulso/engines/` — `engine.ts` (interfaz), `openai.ts`, `gemini.ts`, `perplexity.ts`, `mock.ts`, `index.ts`.
- `lib/pulso/scan.ts` — orquestador.
- `lib/pulso/advice.ts` — 3 acciones a partir del resultado.
- `lib/limits.ts` — límite por IP y por email.
- `app/api/scan/route.ts`, `app/api/lead/route.ts`, `app/api/card/route.tsx` — API.
- `app/page.tsx` + `components/*` — landing, escáner, resultado, planes.
- `lib/copy.ts` — todo el texto de marca en un sitio.

---

### Tarea 1: Andamiaje y herramientas

**Archivos:** `package.json`, `tsconfig.json`, `next.config.mjs`, `vitest.config.ts`, `.env.example`, `.gitignore`.

**Produce:** `npm test`, `npm run build`, `npm run lint`/`typecheck` funcionando.

- [ ] Instalar dependencias y comprobar que `npm run typecheck` pasa con un `app/page.tsx` vacío.
- [ ] `.env.example` con `OPENAI_API_KEY`, `GEMINI_API_KEY`, `PERPLEXITY_API_KEY` (opcionales: sin ellas, motor simulado).
- [ ] Commit `chore: andamiaje`.

### Tarea 2: Marca y URL

**Archivos:** `lib/pulso/brand.ts`, `lib/pulso/brand.test.ts`.

**Produce:**
- `normalizeDomain(input: string): string | null` — host sin `www.`, en minúsculas; `null` si no es una URL válida.
- `brandAliasesFromDomain(domain: string): string[]` — p. ej. `clinicasol.es` → `["clinicasol", "clinica sol"]`.
- `findMentions(text: string, aliases: string[], domain: string): number[]` — posiciones (índice de aparición en la respuesta, empezando en 0) donde aparece la marca; coincidencia por palabra completa, sin acentos ni mayúsculas, o por dominio.

- [ ] Tests: `normalizeDomain("HTTPS://www.ClinicaSol.es/precios?x=1") === "clinicasol.es"`; `normalizeDomain("clinicasol.es")` igual; `normalizeDomain("no es url")` es `null`; `normalizeDomain("javascript:alert(1)")` es `null`.
- [ ] Tests: «Impulso» no menciona la marca «pulso»; «CLÍNICA SOL» sí menciona «clinica sol»; el dominio citado como fuente cuenta como mención.
- [ ] Implementar y pasar.

### Tarea 3: Puntuación

**Archivos:** `lib/pulso/score.ts`, `lib/pulso/score.test.ts`, `lib/pulso/types.ts`.

**Produce:**
- `scoreResponse(a: Analysis): number` (0–100): sin mención 0; con mención 50 + bono de posición (1.ª 30, 2.ª 20, 3.ª 10, resto 0) + tono (positivo 20, neutro 10, negativo 0), tope 100.
- `computePulso(scores: number[]): { score: number; margin: number }` — media redondeada y margen = desviación típica / √n redondeada; `{0,0}` si no hay datos.
- `detectTone(text: string, aliases: string[]): "positive" | "neutral" | "negative"` — léxico en español en la frase de la mención.

- [ ] Tests con los valores exactos de arriba (primera posición + positivo = 100; sin mención = 0; tope).
- [ ] Test: `computePulso([])` es `{score:0, margin:0}`; `computePulso([100,0])` da `score 50`.
- [ ] Implementar y pasar. Los pesos son hipótesis: viven en una constante exportada `WEIGHTS`.

### Tarea 4: Preguntas de comprador

**Archivos:** `lib/pulso/questions.ts`, test.

**Produce:** `buildQuestions(sector: string, city: string): string[]` — exactamente 10, sin duplicados, en español, todas con sector y ciudad.

- [ ] Tests: longitud 10, únicas, contienen la ciudad; entrada con espacios/mayúsculas se limpia; sector vacío lanza error.
- [ ] Implementar con plantillas («mejor {sector} en {ciudad}», «{sector} con buenas reseñas en {ciudad}», «cuánto cuesta…»).

### Tarea 5: Motores y orquestador

**Archivos:** `lib/pulso/engines/*`, `lib/pulso/scan.ts`, `lib/pulso/advice.ts`, tests.

**Produce:**
- `interface Engine { id: "chatgpt" | "gemini" | "perplexity"; ask(question: string): Promise<{ text: string; sources: string[] }> }`
- `getEngines(env): Engine[]` — reales si hay clave, simulado si no.
- `runScan(input: ScanInput, engines: Engine[], repetitions = 2): Promise<ScanResult>` con `{ score, margin, enginesOk, enginesFailed, competitors (top 3), sources, perQuestion, partial: boolean }`.
- `buildAdvice(result): string[]` — exactamente 3 acciones.

- [ ] Test: un motor que lanza error → `partial: true`, nota con el resto.
- [ ] Test: todos fallan → `runScan` lanza `ScanError("all_engines_failed")`.
- [ ] Test: competidores = 3 nombres más repetidos en las respuestas, excluyendo la marca.
- [ ] Test: concurrencia limitada (máx. 6 llamadas simultáneas) y timeout de 20 s por llamada.
- [ ] Implementar adaptadores con `fetch` a las APIs oficiales; el simulado es determinista por semilla (marca + pregunta).

### Tarea 6: API y límites

**Archivos:** `app/api/scan/route.ts`, `app/api/lead/route.ts`, `lib/limits.ts`, tests.

**Produce:** `POST /api/scan` (zod: `url`, `sector` 2–60, `city` 2–60) → 200 resultado | 400 | 429 | 502. `POST /api/lead` (zod: `email`, `scanId`) → 204. `createLimiter({ max, windowMs })` con `hit(key): boolean`.

- [ ] Tests: 3 escaneos/IP/hora, el 4.º recibe 429; email repetido bloqueado 24 h; cuerpo inválido da 400 sin detalles internos; el error de un proveedor nunca filtra claves ni trazas.
- [ ] Implementar. La IP sale de `x-forwarded-for` (primer valor).

### Tarea 7: Interfaz

**Archivos:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components/*`, `lib/copy.ts`.

**Produce:** landing con escáner, estados de carga/resultado/error/parcial, muro suave de email, tarjeta compartible, planes, aviso de que la nota es orientativa.

- [ ] Prueba en el navegador con Playwright: flujo completo con motor simulado, móvil y escritorio, sin errores de consola.

### Tarea 8: Preparación, pulido y validación

- [ ] **ECC:** `CLAUDE.md` del proyecto con el flujo planner → tdd-guide → code-reviewer → security-reviewer; ejecutar code-reviewer y security-reviewer sobre `lib/` y `app/api/`; arreglar CRITICAL y HIGH.
- [ ] **Emil Kowalski:** `emil-design-eng` y `review-animations` sobre la interfaz; aplicar los arreglos.
- [ ] **Taste Skill:** `taste-skill` valida que el diseño encaja con la marca (sobrio, español, confianza) y no parece plantilla de IA.
- [ ] `verification-before-completion`: tests, typecheck y build en verde antes de dar nada por hecho.
