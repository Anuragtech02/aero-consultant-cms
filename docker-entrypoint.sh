#!/bin/sh

# Fetch secrets and update .env file
echo "Fetching database credentials from AWS Secrets Manager..."
node scripts/fetchSecrets.js

# Execute the main command
exec "$@"