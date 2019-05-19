#!/bin/bash

for file in $(find $1 -name "*.zip");
	unzip -qq -d $2 $file
done
