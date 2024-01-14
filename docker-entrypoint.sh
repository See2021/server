#!/bin/sh

# Wait for MySQL to be ready
until nc -z -v -w30 mysql 3306; do
  echo 'Waiting for MySQL to become available...'
  sleep 1
done

# Run Prisma migration
npx prisma migrate dev --name init

# Start the NestJS application
exec npm start