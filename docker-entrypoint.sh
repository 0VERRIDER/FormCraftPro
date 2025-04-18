#!/bin/sh
set -e

# Wait for the database to be ready
echo "Waiting for database to be ready..."
./wait-for-it.sh db:5432 --timeout=60

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Start the application
echo "Starting application..."
npm run build
npm run start