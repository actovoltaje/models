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

## Plugins (`.claude/settings.json`)

- **superpowers** (oficial Anthropic): brainstorming, planes, TDD, debugging sistemático, subagentes.
- **frontend-design** (oficial): interfaces con dirección estética, sin look genérico de IA.
- **claude-code-setup** (oficial): analiza un repo y recomienda hooks, skills, MCP y subagentes.
- **everything-claude-code** (fork de worldflowai): agentes planner/architect/code-reviewer/security-reviewer,
  comandos `/plan`, `/tdd`, `/verify`, `/checkpoint`, `/learn`… y reglas de código.
- **taste-skill** (Leonxlnx): estilos de diseño (minimalist, brutalist, soft, redesign, image-to-code…).
- **task-observer** (rebelytics): observa las sesiones y propone mejoras a tus skills con revisión humana.

## Skills locales (`.claude/skills/`)

Skills de Emil Kowalski (MIT): `animate`, `review-animations`, `improve-animations`,
`emil-design-eng`, `apple-design`, `pick-ui-library`, `break-ui`, `prototype`, etc.

## Excluido a propósito

- **OmniRoute**: proxy que redirige el tráfico de Claude Code a otros proveedores. Requiere un
  servidor siempre encendido y tiene avisos de seguridad publicados. No encaja en sesiones efímeras.
