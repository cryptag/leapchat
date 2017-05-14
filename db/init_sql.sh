#!/bin/bash
# Steve Phillips / elimisteve
# 2017.05.13

set -euo pipefail

# Initialization (create roles, etc)
for file in sql/init*.sql; do
    psql < "$file"
done

# Create tables
for file in sql/table*.sql; do
    psql < "$file"
done

# Run migrations
for file in sql/migration*.sql; do
    psql < "$file"
done
