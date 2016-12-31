var _ = require('lodash'),
    async = require('async'),
    chalk = require('chalk'),
    highland = require('highland'),
    models  = require('./models'),
    numeral = require('numeral'),
    parser = require('fec-parse');

var payload = 1000; // how many rows get processed at a time

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

function importFiling(task,callback) {
    var transaction = null;

    var processed = 0,
        finished = false,
        start = process.hrtime();

    function error(err) {
        if (finished) {
            callback(err);
            return;
        }
        finished = true;

        notify('fecImportFailed',{ filing_id: filing_id });

        console.error(chalk.red(err));

        if (transaction !== null) {
            console.error(chalk.red('rolling back transaction'));

            transaction.rollback()
                .then(callback.bind(this,err))
                .catch(function () {
                    console.error(chalk.red('error rolling back transaction'));

                    callback(err);
                });
        }
        else {
            callback(err);
        }
    }

    function done() {
        finished = true;

        console.info(chalk.green('inserted ' + numeral(processed).format() + ' rows from ' + filing_id));

        transaction.commit()
            .then(function (result) {
                notify('fecImportComplete',{ filing_id: filing_id });

                callback(null,result);
            })
            .catch(error);
    }

    function startTransaction(cb) {
        models.sequelize.transaction()
                .then(cb)
                .catch(error);
    }

    function processRows(rows,cb) {
        if (finished) {
            cb();
            return;
        }

        if (rows[0].report_id === '') {
            rows[0].report_id = null;
        }
        if (rows[0].report_number === '') {
            rows[0].report_number = null;
        }

        rows[0].model
            .bulkCreate(rows,{
                transaction: transaction,
                validate: true
            })
            .then(function () {
                processed += rows.length;

                var elapsed = process.hrtime(start);
                elapsed = elapsed[0] + (elapsed[1] / 1000000000);
                
                console.info(chalk.gray('processed ' +
                        numeral(processed).format() + ' records in ' +
                        numeral(elapsed).format('0.00') + ' seconds at ' +
                        numeral(processed/elapsed).format() + ' rows/second'));

                cb();
            })
            .catch(function (err) {
                if (err.name == 'SequelizeUniqueConstraintError') {
                    console.error(chalk.red('already inserted ' + rows[0].filing_id));
                }
                else {
                    console.error(chalk.red('error inserting ' + rows[0].filing_id + ':'));
                    console.error(chalk.red(err));
                }

                cb(err);
            });
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

            return models.sequelize.query('NOTIFY ' + channel + ',  ' +
                    models.sequelize.escape(JSON.stringify(data)) + ';');
        }
    }

    function processRow(row) {
        row.filing_id = filing_id;

        row.model = formModels.find(function (model) {
            return model.match(row);
        });

        if (row.committee_name && row.form_type && row.filer_committee_id_number &&
            row.form_type.slice(0,3) != 'F24') {
            notify('fecImportStart',row);
        }

        return row;
    }

    function processFiling(openStream, cb) {
        console.info('== importing ' + filing_id + ' ==');

        openStream(function (err,stream) {
            if (err) {
                error(err);
                return;
            }

            stream
                .pipe(parser())
                .pipe(highland.pipeline(function (s) {
                    return s.map(processRow)
                        .filter(function (row) {
                            return typeof row.model !== 'undefined';
                        })
                        .batchWithTimeOrCount(5, payload)
                        .flatMap(function (rows) {
                            return highland(rows)
                                    .group(function (row) {
                                        return row.model.name;
                                    });
                        })
                        .flatMap(highland.values)
                        .map(highland.wrapCallback(processRows))
                        .parallel(2)
                        .stopOnError(error)
                        .done(done);
                }));
        });
    }

    function checkForFiling(id,cb) {
        models.fec_filing.findById(id)
            .then(function (result) {
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

    checkForFiling(filing_id,function () {
        startTransaction(function (t) {
            transaction = t;

            processFiling(task.openStream,done);
        });
    });

}

function FilingQueue() {
    var q = async.queue(importFiling, 1);

    return q;
}

module.exports = new FilingQueue();
