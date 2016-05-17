var fs = require('fs');

function sync() {
    var models = require('../models');

    models.sequelize.sync()
        .then(function () {
            models.sequelize.query(fs.readFileSync(__dirname + '/../models/fec/amended_filing.sql','utf8'));
        });
}

if (process.env.DB_DRIVER == 'postgres') {
    // try to create database first if dialect is postgres
    
    var pg = require('pg');

    var conString = 'postgres://' + process.env.DB_USER + ':' + process.env.DB_PASS +
                    '@' + process.env.DB_HOST + ':' + process.env.DB_PORT +'/postgres';

    pg.connect(conString, function(err, client, done) {
        client.query('CREATE DATABASE ' + process.env.DB_NAME, function(err) {
            client.end();

            sync();
        });
    });
}
else {
    sync();
}
