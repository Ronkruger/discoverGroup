#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
if [ -f "./prisma/schema.prisma" ]; then
  echo "Running Prisma migrate..."
  npx prisma migrate deploy
else
  echo "No prisma schema found"
fi