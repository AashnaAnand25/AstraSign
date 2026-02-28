#!/usr/bin/env bash
# Clone sign/translate and install so you can run their exact pipeline locally.
# Then you can tweak the 2D avatar (e.g. neon) in the cloned repo and point our app at it.
#
# Usage (from repo root):
#   ./scripts/setup-sign-mt-local.sh
#   cd sign-translate && npm start
# Then in AstraSign .env:  VITE_SIGN_VIEWER_URL=http://localhost:4200
# Restart our app (npm run dev) and use Translate — it will load local sign.mt.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLONE_DIR="$REPO_ROOT/sign-translate"

if [ -d "$CLONE_DIR" ]; then
  echo "sign-translate already exists at $CLONE_DIR"
  echo "To update: cd $CLONE_DIR && git pull && npm install"
  exit 0
fi

echo "Cloning sign/translate into $CLONE_DIR ..."
git clone --depth 1 https://github.com/sign/translate.git "$CLONE_DIR"

echo "Installing dependencies (this may take a few minutes) ..."
cd "$CLONE_DIR"
npm install

echo ""
echo "Done. To run sign.mt locally:"
echo "  cd $CLONE_DIR && npm start"
echo "Then in AstraSign create .env (or add to it):"
echo "  VITE_SIGN_VIEWER_URL=http://localhost:4200"
echo "Restart our app (npm run dev). The Translate tab will load your local sign.mt."
echo "To change the 2D avatar (e.g. neon): edit files in $CLONE_DIR/src/app/modules/pose or animation."
echo "See docs/SIGN_MT_LOCAL_CLONE.md for where to edit."
