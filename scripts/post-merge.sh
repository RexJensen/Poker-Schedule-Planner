#!/bin/bash
set -e

pnpm install --frozen-lockfile || pnpm install
pnpm --filter @workspace/db run push-force
