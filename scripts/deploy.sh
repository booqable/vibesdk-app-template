#!/usr/bin/env bash
set -euo pipefail

# Builds every VibeSDK template (upstream + booqable-app) and uploads the zips
# plus template_catalog.json to the deployment's R2 bucket, using the upstream
# tooling from cloudflare/vibesdk-templates.
#
# Requires: git, python3 (PyYAML), bun, wrangler (authenticated against the
# Booqable Cloudflare account).

UPSTREAM_REPO=${UPSTREAM_REPO:-https://github.com/cloudflare/vibesdk-templates.git}
export R2_BUCKET_NAME=${R2_BUCKET_NAME:-vibesdk-templates}

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

echo "Cloning upstream templates into $WORKDIR..."
git clone --depth 1 "$UPSTREAM_REPO" "$WORKDIR"

echo "Injecting booqable-app definition..."
cp "$REPO_ROOT/definitions/booqable-app.yaml" "$WORKDIR/definitions/"
cp -R "$REPO_ROOT/definitions/booqable-app" "$WORKDIR/definitions/"

cd "$WORKDIR"
./deploy_templates.sh
