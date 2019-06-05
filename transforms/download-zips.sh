#!/bin/bash

set -euo pipefail

for file in $(find $1 -name "*.json");
	DIR=$(basename $(dirname $file))
	BASE=$(basename $file .json)
    aws s3 cp s3://cg-519a459a-0ea3-42c2-b7bc-fa1143481f74/bulk-data/$DIR/$BASE.zip $2$DIR --region us-gov-west-1 --no-sign-request
done
