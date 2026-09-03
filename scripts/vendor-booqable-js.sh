#!/usr/bin/env bash
set -euo pipefail

# Re-vendors the @booqable/client library (booqable/booqable.js) into the
# booqable-app template at definitions/booqable-app/src/lib/booqable/.
#
# Requires: git, npm (Node >= 20), and read access to booqable/booqable.js.

REPO=${BOOQABLE_JS_REPO:-https://github.com/booqable/booqable.js.git}
REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
TARGET="$REPO_ROOT/definitions/booqable-app/src/lib/booqable"
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

echo "Cloning $REPO..."
git clone --depth 1 "$REPO" "$WORKDIR/booqable.js"

cd "$WORKDIR/booqable.js"
COMMIT=$(git rev-parse --short HEAD)

echo "Building @booqable/client at $COMMIT..."
npm install --no-audit --no-fund >/dev/null
npm run build >/dev/null

echo "Vendoring into $TARGET..."
rm -rf "$TARGET"
mkdir -p "$TARGET"
cp -R dist/ "$TARGET"/

cat > "$TARGET/VENDORED.md" <<EOF
# Vendored: @booqable/client

This directory is the **built output of [booqable/booqable.js](https://github.com/booqable/booqable.js)**
(commit \`$COMMIT\`), the zero-dependency JavaScript port of the booqable.rb gem.

- **Do not edit these files** — changes belong in the booqable.js repo.
- To update, run \`scripts/vendor-booqable-js.sh\` from the repo root.
- The app-facing entry point is \`src/lib/booqable.ts\`, which exports a
  \`booqable\` client configured for the worker proxy + iframe session; import
  types or errors from \`@/lib/booqable/index.js\` when needed.
EOF

echo "Vendored booqable.js @ $COMMIT"
