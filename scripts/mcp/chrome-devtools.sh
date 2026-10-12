#!/usr/bin/env bash
# Lanza Chrome DevTools MCP. En la nube usa el Chromium preinstalado en headless;
# en local abre tu Chrome normal.
set -euo pipefail
args=()
if [[ -x /opt/pw-browsers/chromium ]]; then
  args+=(--headless --isolated --executablePath /opt/pw-browsers/chromium --chromeArg=--no-sandbox)
fi
exec npx -y chrome-devtools-mcp@1.10.1 "${args[@]}" "$@"
