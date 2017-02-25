// jshint esnext:true

const _ = require('lodash'),
      fs = require('fs'),
      models  = require('./models'),
      moment = require('moment'),
      parser = require('fec-parse'),
      through2 = require('through2');

const filing_id = 1132265;

const parse = parser();

const formModels = [
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

let tableName = null;

function processRow(row, enc, next) {
    row.filing_id = filing_id;

    const model = formModels.find(model => model.match(row));

    if ('report_id' in row && row.report_id) {
        row.report_id = parseInt(row.report_id.replace('FEC-',''));
    }

    if (typeof model !== 'undefined') {
        if (tableName !== model.tableName) {
            if (tableName !== null) {
                this.push('\\.\n');
            }

            tableName = model.tableName;

            if ('created_date' in model.attributes) {
                row.created_date = moment().toISOString();
            }
            if ('updated_date' in model.attributes) {
                row.updated_date = moment().toISOString();
            }

            this.push(`COPY ${tableName} ("${Object.keys(row).join('", "')}") FROM STDIN;\n`);
        }

        const line = `${_.values(row).map(value => {
            if (value && typeof value == 'string') {
                return value
                        .replace(/\\/g,'\\\\')
                        .replace(/\n/g,'\\\n')
                        .replace(/\t/g,'\\\t')
                        .replace(/\\./g,'\\\\.');
            }
            else if (value) {
                return value;
            }
            return '\\N';
        }).join('\t')}\n`;

        this.push(line);
    }

    next();
}

fs.createReadStream(`${__dirname}/../data/downloaded/${filing_id}.fec`,{
        encoding: 'utf8'
    })
    .pipe(parser())
    .pipe(through2.obj(processRow,
    function (next) {
        this.push('\\.\n');

        next();
    }))
    .pipe(process.stdout);
