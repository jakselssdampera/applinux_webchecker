#!/usr/bin/env bash
# ═══════════════════════════════════════════════
# WebSec Auditor — Home Server Auto-Update Script
# ═══════════════════════════════════════════════
set -e

echo "=== [1/4] Pulling latest code from GitHub ==="
git pull origin main

echo "=== [2/4] Rebuilding Docker image and restarting container ==="
docker compose up -d --build

echo "=== [3/4] Cleaning up unused old images ==="
docker image prune -f

echo "=== [4/4] Verifying container health ==="
sleep 3
docker compose ps

echo ""
echo "✅ Update complete! WebSec Auditor is running and up to date."
