#!/bin/sh
set -e

echo "Waiting for database to be ready..."

# Retry logic for database connection
max_attempts=30
attempt=0

until npx prisma migrate deploy || [ $attempt -eq $max_attempts ]; do
  attempt=$((attempt + 1))
  echo "Database not ready, attempt $attempt/$max_attempts. Waiting 2 seconds..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "Failed to connect to database after $max_attempts attempts."
  exit 1
fi

echo "Database is ready! Starting application..."
exec npm run start
