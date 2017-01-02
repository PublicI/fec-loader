var _ = require('lodash'),
    fs = require('fs'),
    moment = require('moment'),
    models  = require('./models'),
    parser = require('fec-parse');

var filing_id = 1047003;

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

var tableName = null;

fs.createReadStream(__dirname + '/../data/downloaded/' + filing_id + '.fec',{
        encoding: 'utf8'
    })
    .pipe(parser())
    .on('data',function (row) {
        row.filing_id = filing_id;

        var model = formModels.find(function (model) {
            return model.match(row);
        });

        if ('report_id' in row && row.report_id) {
            row.report_id = parseInt(row.report_id.replace('FEC-',''));
        }

        if (typeof model !== 'undefined') {
            if (tableName !== model.tableName) {
                if (tableName !== null) {
                    console.log('\\.\n');
                }

                tableName = model.tableName;

                if ('created_date' in model.attributes) {
                    row.created_date = moment().toISOString();
                }
                if ('updated_date' in model.attributes) {
                    row.updated_date = moment().toISOString();
                }

                console.log('COPY ' + tableName + ' (' +
                            '"' + Object.keys(row).join('", "') + '"' +
                            ') FROM STDIN;');
            }

            console.log(_.values(row).map(function (value) {
                if (value) {
                    return value;
                }
                return '\\N';
            }).join('\t'));
        }
    })
    .on('end',function () {
        console.log('\\.\n');
    });
