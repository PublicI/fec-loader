const models = require('@publici/fec-model')({
    driver: 'postgres',
    name: process.env.PGDATABASE || process.env.USER,
    user: process.env.PGPASSWORD
});

module.exports = (options) => {
	return models.sync(() => {});
}
