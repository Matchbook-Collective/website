#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ -x "$PWD/.tools/node-v24.21.0-darwin-arm64/bin/node" ]; then
  PATH="$PWD/.tools/node-v24.21.0-darwin-arm64/bin:$PATH"
  export PATH
fi
export ASTRO_TELEMETRY_DISABLED=1
export npm_config_cache="$PWD/.npm-cache"
exec npm run dev
