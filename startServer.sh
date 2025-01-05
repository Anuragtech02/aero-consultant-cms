#!/bin/bash
set -e

# Run fetchSecrets first
./fetchSecrets.sh

# Check if docker compose command exists (try new version first)
if command -v "docker" &> /dev/null && docker compose version &> /dev/null; then
    echo "Using docker compose..."
    docker compose "$@"
elif command -v "docker-compose" &> /dev/null; then
    echo "Using docker-compose..."
    docker-compose "$@"
else
    echo "Neither docker compose nor docker-compose is available"
    exit 1
fi