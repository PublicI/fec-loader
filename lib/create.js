const models = require('@publici/fec-model')({
    driver: 'postgres'
});

module.exports = () => {
	models.sync(() => {});
}
