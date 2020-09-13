const models = require('@publici/fec-model')({
    driver: 'postgres',
    host: process.env.PGHOST,
    name: process.env.PGDATABASE,
    user: process.env.PGUSER || process.env.USER,
    pass: process.env.PGPASSWORD
});

module.exports = (options) => {
	return models.sync(() => {});
}
