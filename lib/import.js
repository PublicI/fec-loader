var _ = require('lodash'),
    async = require('async'),
    chalk = require('chalk'),
    models  = require('./models'),
    numeral = require('numeral'),
    parser = require('fec-parse'),
    through2 = require('through2'),
    dbStreamer = require('db-streamer'),
    util = require('util');

const payload = 1000; // how many rows get processed at a time

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

function importFiling(task,callback) {
    let transaction = null;

    let processed = 0;
    let finished = false;
    const start = process.hrtime();

    function error(err) {
        console.error(chalk.red(util.inspect(err)));

        if (finished) {
            // callback(err);
            return;
        }
        finished = true;

        notify('fecImportFailed',{ filing_id });

        if (transaction !== null) {
            console.error(chalk.red('rolling back transaction'));

            transaction.rollback()
                .then(callback.bind(this,err))
                .catch(() => {
                    console.error(chalk.red('error rolling back transaction'));

                    callback(err);
                });
        }
        else {
            callback(err);
        }
    }

    function done() {
        if (finished) {
            console.error('callback already called');

            return;
        }

        finished = true;

        console.info(chalk.green(`inserted ${numeral(processed).format()} rows from ${filing_id}`));

        transaction.commit()
            .then(result => {
                notify('fecImportComplete',{ filing_id });

                callback(null,result);
            })
            .catch(error);
    }

    function startTransaction(cb) {
        models.sequelize.transaction()
                .then(cb)
                .catch(error);
    }

    function notify(channel,data) {
        if (models.sequelize.getDialect() == 'postgres') {
            data = _.pick(data,[
                'filing_id',
                'form_type',
                'committee_name',
                'organization_name',
                'filer_committee_id_number',
                'coverage_from_date',
                'coverage_through_date',
                'col_a_total_receipts',
                'col_a_total_disbursements',
                'col_a_cash_on_hand_close_of_period']);

            return models.sequelize.query(`NOTIFY ${channel},  ${models.sequelize.escape(JSON.stringify(data))};`);
        }
    }

    function processRow(row) {
        row.filing_id = filing_id;

        row.model = formModels.find(model => model.match(row));

        if ('report_id' in row && row.report_id) {
            row.report_id = parseInt(row.report_id.replace('FEC-',''));
        }

        if (row.committee_name && row.form_type && row.filer_committee_id_number &&
            row.form_type.slice(0,3) != 'F24') {
            notify('fecImportStart',row);
        }

        return row;
    }

    function processFiling(openStream, cb) {
        console.info(`== importing ${filing_id} ==`);

        openStream((err, stream) => {
            if (err) {
                error(err);
                return;
            }

            stream
                .pipe(parser())
                .pipe(through2.obj(function (row, enc, next) {
                    row = processRow(row);

                    if (typeof row.model !== 'undefined') {
                        this.push(row);

                        if (processed !== 0 && processed%payload === 0) {
                            let elapsed = process.hrtime(start);
                            elapsed = elapsed[0] + (elapsed[1] / 1000000000);
                            
                            console.info(chalk.gray(`processed ${numeral(processed).format()} records in ${numeral(elapsed).format('0.00')} seconds at ${numeral(processed/elapsed).format()} rows/second`));
                        }

                        processed++;
                    }

                    next();
                }))
                .pipe(dbStreamer({
                    sequelize: models.sequelize,
                    transaction
                }))
                .on('end',done)
                .on('error',error);
        });
    }

    function checkForFiling(id,cb) {
        models.fec_filing.findById(id)
            .then(result => {
                if (result) {
                    callback();
                }
                else {
                    cb();
                }
            })
            .catch(error);
    }

    var filing_id = task.name.replace(/[^0-9]+/g,''); // assume the filing number is just the numeric portion of the file name

    checkForFiling(filing_id,() => {
        startTransaction(t => {
            transaction = t;

            processFiling(task.openStream,done);
        });
    });
}

function FilingQueue() {
    const q = async.queue(importFiling, 1);

    return q;
}

module.exports = new FilingQueue();
