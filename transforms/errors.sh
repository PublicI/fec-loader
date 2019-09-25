#!/bin/bash

set -euo pipefail

for file in $(find $1 -type f -not -empty -ls);
do
	ln -s $file $2
done
