const models = require('@publici/fec-model')({
    driver: 'postgres'
});

module.exports = () => {
	return models.sync();
}
