# fec-loader
Loads raw FEC filings into a database.

To install:
```bash
npm install -g github:PublicI/fec-loader#cli
```

To load a filing from the FEC into a Postgres database, run:

```bash
export PGHOST=<database host> PGDATABASE=<database name> PGUSER=<database user> PGPASSWORD=<database password>
curl -s http://docquery.fec.gov/dcdev/posted/1283013.fec | fec2psql | psql
```
