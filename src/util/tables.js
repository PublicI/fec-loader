var _ = require('lodash'),
    Tables = require('tables'),
    models  = require('../models'),
    parser = require('fec-parse');

var filing_id = 1132265;

var parse = parser();

var formModels = [
    models.fec_paper_filing,
    models.fec_paper_contribution,
    models.fec_paper_expenditure,
    models.fec_filing,
    models.fec_presidential_summary,
    models.fec_pac_summary,
    models.fec_group_summary,
    models.fec_lobbyist_bundler,
    models.fec_contribution,
    models.fec_expenditure,
    models.fec_debt,
    models.fec_loan,
    models.fec_ie
];

var t = new Tables({
    db: process.env.DB_DRIVER + '://' +
        process.env.DB_USER + ':' + process.env.DB_PASS + '@' +
        process.env.DB_HOST + ':' + process.env.DB_PORT + '/' +
        process.env.DB_NAME,
    models: _(models.sequelize.models).mapValues(function (model) {
        return {
            tableName: model.tableName,
            modelName: model.name,
            fields: model.attributes,
            options: model.options
        };
    }).mapKeys(function (model,key) {
        return model.tableName;
    }).value(),
    input: __dirname + '/../data/downloaded/' + filing_id + '.fec',
    pipe: parse,
    output: true,
    autoparse: false,
    parser: function (row) {
        var model = formModels.find(function (model) {
            return model.match(row);
        });

        var parsed = [],
            parsedRow = {};

        if (typeof model !== 'undefined' && model) {
            row.filing_id = filing_id;

            if ('created_date' in model.attributes) {
                row.created_date = new Date();
                row.updated_date = new Date();
            }
            if ('report_id' in model.attributes && row.report_id === '') {
                row.report_id = null;
            }
            if ('report_number' in model.attributes && row.report_number === '') {
                row.report_number = null;
            }

            parsedRow[model.name] = row;

            parsed.push(parsedRow);
        }

        return parsed;
    }
});
