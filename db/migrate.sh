#!/bin/bash
# Steve Phillips / elimisteve
# 2017.05.18

set -euo pipefail

# Run migrations
for file in $*; do
    psql -U ${pg_user:-postgres} -d leapchat < "$file"
done
