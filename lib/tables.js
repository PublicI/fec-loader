const models = require('@publici/fec-model')({
    driver: 'postgres'
});
const { Tables } = require('tables');
const parser = require('fec-parse');

const filing_id = 1132265;

const parse = parser();

const formModels = [
    models.fec_paper_filing,
    models.fec_paper_campaign_summary,
    models.fec_paper_contribution,
    models.fec_paper_expenditure,
    models.fec_filing,
    models.fec_presidential_summary,
    models.fec_pac_summary,
    models.fec_campaign_summary,
    models.fec_group_summary,
    models.fec_lobbyist_bundler,
    models.fec_contribution,
    models.fec_expenditure,
    models.fec_debt,
    models.fec_loan,
    models.fec_ie
];

var t = new Tables({
    models,
    input: __dirname + '/../data/downloaded/' + filing_id + '.fec',
    pipe: parse,
    output: true,
    autoparse: false,
    parser: function(row) {
        const model = formModels.find(model => model.match(row));

        const parsed = [];
        const parsedRow = {};

        if (typeof model !== 'undefined' && model) {
            row.filing_id = filing_id;

            if ('created_date' in model.attributes) {
                row.created_date = new Date();
                row.updated_date = new Date();
            }
            if ('report_id' in model.attributes && row.report_id === '') {
                row.report_id = null;
            }
            if (
                'report_number' in model.attributes &&
                row.report_number === ''
            ) {
                row.report_number = null;
            }

            parsedRow[model.name] = row;

            parsed.push(parsedRow);
        }

        return parsed;
    }
});
