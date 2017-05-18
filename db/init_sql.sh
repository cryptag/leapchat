#!/bin/bash
# Steve Phillips / elimisteve
# 2017.05.13

set -euo pipefail

# Create 'leapchat' database, associated role
psql < sql/pre.sql

# More initialization
for file in sql/init*.sql; do
    psql leapchat < "$file"
done

# Create tables
for file in sql/table*.sql; do
    psql leapchat < "$file"
done

/bin/bash migrate.sh sql/migration*.sql
