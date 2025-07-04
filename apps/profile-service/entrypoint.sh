#!/bin/sh

# Wait for postgres to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Run migrations
echo "Running database migrations..."
cd /app
pnpm prisma migrate deploy --schema=./prisma/schema.prisma

# Start the service
echo "Starting profile service..."
cd /app/apps/profile-service
node dist/main.js
