# Toolkit de Claude Code (Acto Voltaje)

Este repo es la base de configuración: cualquier sesión de Claude Code abierta sobre él
(nube o local) carga automáticamente los MCP, plugins y skills de abajo.

## MCP (`.mcp.json`)

| Servidor | Para qué | Requisito |
|---|---|---|
| `playwright` | Navegar, rellenar formularios, capturas, testing E2E | Dominios permitidos en la red del entorno |
| `chrome-devtools` | Depurar rendimiento, consola, red y Lighthouse de una web | Igual que Playwright |
| `context7` | Documentación actualizada de librerías ("use context7") | `mcp.context7.com` permitido; `CONTEXT7_API_KEY` opcional |
| `perplexity` | Búsqueda e investigación web con fuentes | `PERPLEXITY_API_KEY` + `api.perplexity.ai` permitido |

Los wrappers de `scripts/mcp/` usan el Chromium preinstalado en headless cuando corren en la nube
y el navegador normal en local. Versiones fijadas a propósito: subirlas a mano.

## Plugins oficiales (`.claude/settings.json`)

- **frontend-design**: interfaces con dirección estética, sin look genérico de IA.
- **claude-code-setup**: analiza un repo y recomienda hooks, skills, MCP y subagentes.

## Copiado en el repo (`.claude/`)

Los plugins de terceros no se instalan solos en las sesiones en la nube, así que su contenido
está copiado aquí (licencias en `third_party_licenses/`). Para actualizarlos, volver a copiar
desde el repo original.

- **Everything Claude Code** (worldflowai, fork de affaan-m): agentes en `.claude/agents/`,
  comandos en `.claude/commands/`, reglas en `.claude/rules/`, skills de patrones/TDD/verificación.
  Renombrados para no chocar con comandos de Claude Code: `/ecc-plan`, `/ecc-code-review`,
  skill `ecc-security-review`. Sus hooks no se han copiado (usaban un formato que Claude Code no reconoce y bloqueaban la creación de .md).
- **Superpowers** (obra): brainstorming, writing-plans, systematic-debugging, TDD, subagentes.
- **Taste Skill** (Leonxlnx): taste-skill, minimalist, brutalist, soft, redesign, image-to-code, brandkit…
- **Task Observer** (rebelytics): observa las sesiones y propone mejoras a las skills con revisión humana.
- **Emil Kowalski**: `animate`, `review-animations`, `improve-animations`, `emil-design-eng`, `apple-design`…

## Excluido a propósito

- **OmniRoute**: proxy que redirige el tráfico de Claude Code a otros proveedores. Requiere un
  servidor siempre encendido y tiene avisos de seguridad publicados. No encaja en sesiones efímeras.
