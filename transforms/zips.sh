#!/bin/bash

set -euo pipefail

write_zips () {
	local PARENT_DIR=$1
	local DIR=$2
	local YEAR_PREFIX=$3
	local ZIPS=$(aws s3api list-objects-v2 --region us-gov-west-1 --bucket cg-519a459a-0ea3-42c2-b7bc-fa1143481f74 --prefix "bulk-downloads/"$DIR"/"$YEAR_PREFIX --no-sign-request --query "Contents[].{Key:Key,ETag:ETag,Size:Size}" | jq -c '.[]')

	mkdir -p $PARENT_DIR$DIR

	for zip in $ZIPS;
	do
		KEY=$(echo $zip | jq -r '.Key')
		BASE=$(basename $KEY .zip)
		echo $zip > $PARENT_DIR$DIR"/"$BASE".json"
	done
}

write_zips $1 'electronic' '201'
write_zips $1 'paper' '201'
