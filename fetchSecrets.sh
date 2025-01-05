#!/bin/bash
set -e

echo "Fetching database credentials from AWS Secrets Manager..."
SECRET=$(aws secretsmanager get-secret-value --secret-id hmweb-dev-rds --region us-west-2 --query 'SecretString' --output text)

# Extract values from JSON
HOST=$(echo $SECRET | jq -r '.host')
PORT=$(echo $SECRET | jq -r '.port')
USERNAME=$(echo $SECRET | jq -r '.username')
PASSWORD=$(echo $SECRET | jq -r '.password')
DBNAME=$(echo $SECRET | jq -r '.dbInstanceIdentifier')

# Path to .env file
ENV_FILE="./backend/.env"

# Create a temporary file
TEMP_ENV=$(mktemp)

# If .env exists, copy all non-DATABASE_ variables to temp file
if [ -f "$ENV_FILE" ]; then
    echo "Found existing .env file, preserving non-database variables..."
    grep -v "^DATABASE_" "$ENV_FILE" > "$TEMP_ENV" || true
fi

# Append database variables
cat >> "$TEMP_ENV" << EOF
DATABASE_HOST=$HOST
DATABASE_PORT=$PORT
DATABASE_USERNAME=$USERNAME
DATABASE_PASSWORD=$PASSWORD
DATABASE_NAME=$DBNAME
DATABASE_CLIENT=postgres
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
EOF

# Move temp file to .env
mv "$TEMP_ENV" "$ENV_FILE"

echo "Successfully updated backend/.env file with database credentials while preserving other variables"