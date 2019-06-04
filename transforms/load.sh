#!/bin/bash

set -euo pipefail

for file in $(find $1 -name "*.fec.gz");
do
	gunzip < $file | ./bin/fec convert --format=psql $(echo $file | tr -dc '0-9') | (echo "DELETE FROM fec_filings WHERE filing_id = $(echo $file | tr -dc '0-9');" && cat) | psql -v ON_ERROR_STOP=on --single-transaction 2> $2$(echo $file | tr -dc '0-9')".log"
done
