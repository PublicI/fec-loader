const models = require('@publici/fec-model')({
        driver: 'postgres'
    }),
    moment = require('moment'),
    parser = require('fec-parse'),
    through2 = require('through2');

module.exports = (options) => {
    const inStream = options.in || process.stdin;
    const outStream = options.out || process.stdout;

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

    const filing_id = options.filing_id;

    let tableName = null;

    function processRow(row, enc, next) {
        row.filing_id = filing_id;

        const model = formModels.find(model => model.match(row));

        if ('report_id' in row && row.report_id) {
            row.report_id = parseInt(row.report_id.replace('FEC-', '').replace('SEN-',''));
        }

        if (typeof model !== 'undefined') {
            if (tableName !== model.tableName) {
                if (tableName !== null) {
                    this.push('\\.\n');
                }

                tableName = model.tableName;

                if ('created_date' in model.rawAttributes) {
                    row.created_date = moment().toISOString();
                }
                if ('updated_date' in model.rawAttributes) {
                    row.updated_date = moment().toISOString();
                }

                this.push(
                    `COPY ${tableName} ("${Object.keys(row).join(
                        '", "'
                    )}") FROM STDIN;\n`
                );
            }

            const line = `${Object.values(row)
                .map(value => {
                    if (value && typeof value == 'string') {
                        return value
                            .replace(/\\/g, '\\\\')
                            .replace(/\n/g, '\\\n')
                            .replace(/\t/g, '\\\t')
                            .replace(/\/\\./g, '')
                            .replace(/\\\\./g, '')
                            .replace(/\\\./g, '\\\\.');
                    } else if (value) {
                        return value;
                    }
                    return '\\N';
                })
                .join('\t')}\n`;

            this.push(line);
        }

        next();
    }

    return inStream
        .pipe(parser())
        .pipe(
            through2(
                { objectMode: true },
                processRow,
                function (next) {
                    this.push('\\.\n');
                    next();
                }
            )
        )
        .pipe(outStream);
}
