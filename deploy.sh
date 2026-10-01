#!/usr/bin/env bash
# Builds and starts FinZen on the VM. Replace YOUR_VM_IP with the VM's external IP
# and create .env (cp .env.example .env) with JWT_SECRET before the first run.
export VITE_API_BASE_URL=http://YOUR_VM_IP:3000
export CORS_ORIGIN=http://YOUR_VM_IP,http://127.0.0.1
docker compose up -d --build
