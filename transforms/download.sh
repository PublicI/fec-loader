#!/bin/bash

for file in $(find $1 -name "*.fec");
do
	curl -s "http://docquery.fec.gov/dcdev/posted/$(basename $file)" | gzip -9 > $2"$(basename $file).gz"
done
