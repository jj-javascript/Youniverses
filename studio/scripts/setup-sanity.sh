#!/usr/bin/env bash
set -euo pipefail

# One-shot Sanity setup after `npx sanity login` and `npm install` in studio/.
# Usage: ./studio/scripts/setup-sanity.sh

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
STUDIO_DIR="$ROOT_DIR/studio"

cd "$STUDIO_DIR"

if ! npx sanity@latest projects list >/dev/null 2>&1; then
  echo "Not logged in. Run: cd studio && npx sanity login"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing Studio dependencies..."
  npm install --no-audit --no-fund
fi

echo "Deploying schema..."
npm run schema:deploy

echo "Ensuring dataset exists..."
npx sanity dataset create production01 --visibility public 2>/dev/null || true

echo "Adding CORS origins..."
npx sanity cors add http://localhost:8080 --no-credentials || true
npx sanity cors add http://localhost:8765 --no-credentials || true

if [ -n "${SANITY_WRITE_TOKEN:-}" ]; then
  echo "Seeding sample posts..."
  npm run seed
else
  echo "Skipping seed (set SANITY_WRITE_TOKEN to seed sample posts)."
fi

echo "Sanity setup complete. Start Studio with: cd studio && npm run dev"
