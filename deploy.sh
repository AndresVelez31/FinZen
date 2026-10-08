#!/usr/bin/env bash
# Builds and starts FinZen on the VM: bash deploy.sh <VM external IP>
# Create .env (cp .env.example .env) with JWT_SECRET before the first run.
# The IP comes as an argument, so the file never changes on the VM and git pull stays clean.
set -e

VM_IP="${1:?Uso: bash deploy.sh <IP externa de la VM>, por ejemplo: bash deploy.sh 136.64.179.51}"

export VITE_API_BASE_URL="http://${VM_IP}:3000"
export CORS_ORIGIN="http://${VM_IP},http://127.0.0.1"
docker compose up -d --build
