#!/usr/bin/env bash
# Lanza Playwright MCP. En la nube de Claude Code usa el Chromium preinstalado
# (/opt/pw-browsers/chromium) en modo headless; en local usa el navegador por defecto.
set -euo pipefail
args=()
if [[ -x /opt/pw-browsers/chromium ]]; then
  args+=(--headless --no-sandbox --executable-path /opt/pw-browsers/chromium)
fi
exec npx -y @playwright/mcp@0.0.83 "${args[@]}" "$@"
