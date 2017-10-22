#!/bin/bash

set -euo pipefail

# Create 'leapchat' database, associated role
psql -d postgres < sql/pre.sql

export pg_user=postgres
if [ "`uname -s`" != "Linux" ]; then
    # For Mac OS X
    pg_user=$USER
fi

# More initialization
for file in sql/init*.sql; do
    psql -U $pg_user -d leapchat < "$file"
done

# Create tables
for file in sql/table*.sql; do
    psql -U $pg_user -d leapchat < "$file"
done

/bin/bash migrate.sh sql/migration*.sql
