#!/usr/bin/with-contenv bashio
set -e

echo "Starting Svelte Lights Dashboard (websocket, auto auth)..."
node /app/server.js
