#!/bin/bash
# Steve Phillips / elimisteve
# 2017.05.18

set -euo pipefail

# Run migrations
for file in $*; do
    psql -d leapchat < "$file"
done
