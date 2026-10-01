#!/usr/bin/env bash
set -euo pipefail

# Copies the README and type declarations of the @booqable/client version
# pinned in definitions/booqable-app.yaml into <overlay dir>/docs/booqable-client/.
#
# The app builder agent only sees files seeded from the template, never
# node_modules, so the package docs have to travel with the template.
#
# Usage: bundle-client-docs.sh <overlay dir>
# Requires: python3 (PyYAML), npm.

OVERLAY=${1:?usage: $0 <overlay dir>}
REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

VERSION=$(python3 -c '
import sys, yaml
print(yaml.safe_load(open(sys.argv[1]))["package_patches"]["dependencies"]["@booqable/client"])
' "$REPO_ROOT/definitions/booqable-app.yaml")
DOCS="$OVERLAY/docs/booqable-client"

echo "Bundling @booqable/client@$VERSION docs into $DOCS..."
npm pack "@booqable/client@$VERSION" --pack-destination "$WORKDIR" --silent >/dev/null
tar -xzf "$WORKDIR"/booqable-client-*.tgz -C "$WORKDIR"

rm -rf "$DOCS"
mkdir -p "$DOCS/types"
cp "$WORKDIR/package/README.md" "$DOCS/"
(cd "$WORKDIR/package/dist" && find . -name '*.d.ts' | tar -cf - -T -) | tar -xf - -C "$DOCS/types"
