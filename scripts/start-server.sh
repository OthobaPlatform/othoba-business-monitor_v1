#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
exec node backend/server.mjs
