const models = require('@publici/fec-model')({
    driver: 'postgres'
});

module.exports = (options) => {
	return models.sync();
}
