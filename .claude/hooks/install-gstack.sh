#!/usr/bin/env bash
# SessionStart: instala gstack (garrytan/gstack) en las sesiones en la nube de Claude Code,
# que arrancan con un contenedor limpio. En local no hace nada: allí se instala una vez a mano.
set -uo pipefail
[[ "${CLAUDE_CODE_REMOTE:-}" == "true" ]] || exit 0

GSTACK_REF="e23f7b8"   # versión fijada; para actualizar, cambiar este commit
DEST="$HOME/.claude/skills/gstack"

# Navegador: usar el Chromium preinstalado (la descarga de Playwright está bloqueada por la red).
if [[ -x /opt/pw-browsers/chromium ]]; then
  export GSTACK_CHROMIUM_PATH=/opt/pw-browsers/chromium GSTACK_CHROMIUM_NO_SANDBOX=1
  if [[ -n "${CLAUDE_ENV_FILE:-}" ]]; then
    echo "export GSTACK_CHROMIUM_PATH=/opt/pw-browsers/chromium" >> "$CLAUDE_ENV_FILE"
    echo "export GSTACK_CHROMIUM_NO_SANDBOX=1" >> "$CLAUDE_ENV_FILE"
  fi
fi

[[ -x "$DEST/browse/dist/browse" ]] && exit 0

{
  rm -rf "$DEST"
  git clone -q --filter=blob:none https://github.com/garrytan/gstack.git "$DEST" &&
    git -C "$DEST" checkout -q "$GSTACK_REF" &&
    (cd "$DEST" && ./setup </dev/null)
} > /tmp/gstack-setup.log 2>&1 || echo "gstack: la instalación falló, ver /tmp/gstack-setup.log" >&2
exit 0
