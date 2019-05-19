#!/bin/bash

mkdir -p ./data/rss
mkdir -p ./data/download
mkdir -p ./data/load
./transforms/rss.sh ./data/rss/
./transforms/download.sh ./data/rss/ ./data/download/
./transforms/load.sh ./data/download/ ./data/load/
./transforms/notify.sh ./data/load/
