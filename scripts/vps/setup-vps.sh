#!/usr/bin/env bash
# Prepara un VPS Ubuntu/Debian (p. ej. Hostinger) para tener Claude Code siempre encendido
# y manejarlo desde la app de Claude con Remote Control, aunque el portátil esté apagado.
#
# Uso (como root en el VPS):
#   bash setup-vps.sh [usuario]        # usuario por defecto: claude
#
# Antes: añade tu clave SSH pública en hPanel (VPS → Configuración → Claves SSH),
# para que esté en /root/.ssh/authorized_keys y se copie al usuario nuevo.
set -euo pipefail

USER_NAME="${1:-claude}"
WORK_DIR="/home/${USER_NAME}/work"
SERVICE="claude-remote"

if [[ $EUID -ne 0 ]]; then
  echo "Ejecuta este script como root." >&2
  exit 1
fi

echo "==> Paquetes base"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git tmux ufw ca-certificates

echo "==> Usuario '${USER_NAME}' (sin trabajar como root)"
if ! id "$USER_NAME" &>/dev/null; then
  adduser --disabled-password --gecos "" "$USER_NAME"
fi
usermod -aG sudo "$USER_NAME"
install -d -m 700 -o "$USER_NAME" -g "$USER_NAME" "/home/${USER_NAME}/.ssh"
if [[ -s /root/.ssh/authorized_keys ]]; then
  install -m 600 -o "$USER_NAME" -g "$USER_NAME" /root/.ssh/authorized_keys \
    "/home/${USER_NAME}/.ssh/authorized_keys"
fi
install -d -o "$USER_NAME" -g "$USER_NAME" "$WORK_DIR"

echo "==> Firewall: solo SSH entrante"
ufw allow OpenSSH
ufw --force enable

echo "==> SSH: solo con clave (si ya hay una configurada)"
if [[ -s "/home/${USER_NAME}/.ssh/authorized_keys" ]]; then
  cat > /etc/ssh/sshd_config.d/10-hardening.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
EOF
  systemctl reload ssh 2>/dev/null || systemctl reload sshd
else
  echo "   AVISO: no hay clave SSH en /root/.ssh/authorized_keys; dejo la contraseña activa."
fi

echo "==> Claude Code para '${USER_NAME}'"
sudo -iu "$USER_NAME" bash -c 'curl -fsSL https://claude.ai/install.sh | bash'

echo "==> Servicio que mantiene Remote Control encendido (también tras reinicios)"
cat > "/etc/systemd/system/${SERVICE}.service" <<EOF
[Unit]
Description=Claude Code Remote Control (tmux)
After=network-online.target
Wants=network-online.target

[Service]
Type=forking
User=${USER_NAME}
WorkingDirectory=${WORK_DIR}
Environment=PATH=/home/${USER_NAME}/.local/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/bin/tmux new-session -d -s claude "claude remote-control"
ExecStop=/usr/bin/tmux kill-session -t claude
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload

cat <<EOF

Listo. Faltan dos pasos que requieren tu cuenta de Claude:

  1) Inicia sesión una vez:
       su - ${USER_NAME}
       cd ${WORK_DIR} && claude        # sigue el enlace de login, luego /exit
       exit

  2) Activa el servicio:
       systemctl enable --now ${SERVICE}

La sesión aparecerá en la app de Claude (Claude Code). Para verla en el VPS:
  sudo -iu ${USER_NAME} tmux attach -t claude     (salir sin cerrarla: Ctrl+b, luego d)

Antes de cerrar esta conexión, comprueba en OTRA terminal que entras con:
  ssh ${USER_NAME}@<IP_DEL_VPS>
EOF
