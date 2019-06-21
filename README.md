# fec-cli

A set of flexible command line utilities designed to discover, convert and load raw FEC filings into a database in a fast, streaming manner.

`fec` is about nine times faster than similar solutions. For example, on a recent MacBook Air, a 2.3 gigabyte ActBlue filing parses in three minutes instead of 23 minutes.

It requires [Node](https://nodejs.org/). It uses [fec-parse](https://github.com/PublicI/fec-parse).

## Try

To try converting a filing to newline-separated JSON without installing fec-loader, paste the following into a terminal:
```bash
FILING_ID=1283013; curl -s "https://docquery.fec.gov/dcdev/posted/"$FILING_ID".fec" | npx -p @publici/fec-loader convert $FILING_ID > $FILING_ID".ndjson"
```
## Install

To install:
```bash
npm install -g @publici/fec-loader
```
## Setup

To set up a Postgres database for FEC filings and the environment variables needed to connect:
```bash
export PGHOST=<database host> PGDATABASE=<database name> PGUSER=<database user> PGPASSWORD=<database password>
fec init
```

## Use

To load a filing from the FEC into a Postgres database, run:
```bash
export PGHOST=<database host> PGDATABASE=<database name> PGUSER=<database user> PGPASSWORD=<database password>
FILING_ID=1283013; curl -s "https://docquery.fec.gov/dcdev/posted/"$FILING_ID".fec" | fec convert $FILING_ID --format=psql | psql
```

To list the filings available from the FEC's RSS feed run:
```bash
fec list --rss
```

To load the most recent five filings from the FEC's RSS feed, run:

```bash
for url in $(fec list --rss --headers=false --columns=fec_url --format=tsv | head -n 5); do curl -s $url | fec convert $(echo $url | tr -dc '0-9') --format=psql | psql -v ON_ERROR_STOP=on --single-transaction; done
```

To get just a summary line as JSON:
```bash
FILING_ID=1283013; curl -s "https://docquery.fec.gov/dcdev/posted/"$FILING_ID".fec" | head -n 10 | fec convert | sed -n 2p
```
