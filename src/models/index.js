var rread = require('readdir-recursive'),
    path = require('path'),
    Sequelize = require('sequelize');

var basename = path.basename(module.filename);

var sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS,{
    host: process.env.DB_HOST,
    dialect: process.env.DB_DRIVER,
    define: {
        createdAt: 'created_date',
        updatedAt: 'updated_date',
        underscored: true
    },
    logging: false
});

var db = {};

rread
    .fileSync(__dirname)
    .filter(function(file) {
        file = path.basename(file);
        return (file.slice(-3) === '.js') && (file.indexOf('.') !== 0) && (file !== basename);
    })
    .forEach(function(file) {
        var model = sequelize['import'](file);
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
