var models = require('fec-model');

module.exports = models({
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    host: process.env.DB_HOST,
    driver: process.env.DB_DRIVER,
    port: process.env.DB_PORT
});
