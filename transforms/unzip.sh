#!/bin/bash

set -euo pipefail

for file in $(find $1 -name "*.zip");
do
	unzip -qq -d $2 $file
done
