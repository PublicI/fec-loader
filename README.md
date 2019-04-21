# fec-loader

A set of flexible command line utilities designed to discover, convert and load raw FEC filings into a database in a fast, streaming manner.

`fec-loader` is about nine times faster than similar Python solutions. For example, on a recent MacBook Air, a 2.3 gigabyte ActBlue filing parses in three minutes instead of 23 minutes.

It requires [Node](https://nodejs.org/) and Bash.

To try converting a filing to newline-separated JSON without installing fec-loader, paste the following into a terminal:
```bash
FILING_ID=1283013; curl -s "http://docquery.fec.gov/dcdev/posted/"$FILING_ID".fec" | npx -p @publici/fec-loader fec2json $FILING_ID > $FILING_ID".ndjson"
```

To install:
```bash
npm install -g @publici/fec-loader
```

To set up a Postgres database for FEC filings and the environment variables needed to connect:
```
export PGHOST=<database host> PGDATABASE=<database name> PGUSER=<database user> PGPASSWORD=<database password>
createfecschema
```

To load a filing from the FEC into a Postgres database, run:
```bash
FILING_ID=1283013; curl -s "http://docquery.fec.gov/dcdev/posted/"$FILING_ID".fec" | fec2psql $FILING_ID | psql
```

To list the filings available from the FEC's RSS feed run:
```bash
rss2fec
```

To load the most recent five filings from the FEC's RSS feed, run:

```bash
rss2psql | psql
```

To get just a summary line as JSON:
```bash
FILING_ID=1283013; curl -s "http://docquery.fec.gov/dcdev/posted/"$FILING_ID".fec" | head -n 10 | fec2json | sed -n 2p
```
