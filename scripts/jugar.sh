#!/usr/bin/env bash
# Levanta Bug Squad en tu máquina y la publica con un túnel de Cloudflare (gratis, sin cuenta).
# Además le dice a GitHub Actions a qué URL avisarle a Shakira.
# Uso: ./scripts/jugar.sh   (Ctrl+C para apagar el túnel)
set -euo pipefail
cd "$(dirname "$0")/.."

command -v cloudflared >/dev/null || brew install cloudflared

# 1) Secreto compartido backend <-> GitHub Actions (se genera solo la primera vez)
if [ ! -f .env ]; then
  SECRET=$(openssl rand -hex 32)
  cat > .env <<EOF
SHAKIRA_WEBHOOK_SECRET=$SECRET
SHAKIRA_MIN_DELAY=120
SHAKIRA_MAX_DELAY=300
SHAKIRA_REPO_URL=https://github.com/GorkyAnge/shakira-bugs
SHAKIRA_ALLOWED_ORIGINS=http://localhost:3000,https://*.trycloudflare.com
EOF
  printf '%s' "$SECRET" | gh secret set SHAKIRA_WEBHOOK_SECRET
  echo "🔐 Secreto creado en .env y guardado en GitHub"
fi

# 2) App (frontend en :3000, que redirige /api y /ws al backend)
docker compose up -d --build

# 3) Túnel público
LOG=$(mktemp)
cloudflared tunnel --no-autoupdate --url http://localhost:3000 >"$LOG" 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null; echo; echo "Túnel cerrado. La app sigue en http://localhost:3000 (docker compose down para apagarla)."' EXIT

URL=""
for _ in $(seq 1 60); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" | head -1 || true)
  [ -n "$URL" ] && break
  sleep 1
done
[ -z "$URL" ] && { echo "No se pudo abrir el túnel:"; cat "$LOG"; exit 1; }

# 4) GitHub Actions avisará a esta URL (cambia cada vez que reinicias el túnel)
gh variable set SHAKIRA_API_URL --body "$URL"

echo
echo "💃 Bug Squad está en línea:  $URL"
echo "   Comparte ese enlace con tus amigos. Ctrl+C para cerrar el túnel."
wait $PID
