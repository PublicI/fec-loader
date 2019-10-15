#!/bin/bash

set -euo pipefail

./bin/fec list --rss --headers=false --format=tsv --columns=fec_url | head -n 100 | while read url; do
	echo "$(echo $url | tr -dc '0-9').fec" > $1"$(echo $url | tr -dc '0-9').fec";
done
