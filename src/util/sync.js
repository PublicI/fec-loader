var fs = require('fs');

function sync(cb) {
    var models = require('../models');

    console.info('syncing models to database');
    models.sequelize.sync()
        .then(function () {

            console.info('creating amended filing view if it doesn\'t exist');
            models.sequelize.query(fs.readFileSync(__dirname + '/../models/fec/amended_filing.sql','utf8'))
                .catch(function (err) {
                    if (err.name !== 'SequelizeDatabaseError') {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                })
                .then(function () {
                    cb();
                });
        });
}

module.exports = function (cb) {

    if (process.env.DB_DRIVER == 'postgres') {
        // try to create database first if dialect is postgres
        
        var pg = require('pg');

        var conString = 'postgres://' + process.env.DB_USER + ':' + process.env.DB_PASS +
                        '@' + process.env.DB_HOST + ':' + process.env.DB_PORT +'/postgres';

        console.info('connecting to database server');
        pg.connect(conString, function(err, client, done) {
            console.info('creating database if it doesn\'t exist');
            client.query('CREATE DATABASE ' + process.env.DB_NAME, function(err) {
                client.end();

                sync(cb);
            });
        });
    }
    else {
        sync(cb);
    }

};
