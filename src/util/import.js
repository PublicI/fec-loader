var models  = require('../models'),
    async = require('async'),
    numeral = require('numeral'),
    parser = require('fec-parse'),
    _ = require('lodash'),
    highland = require('highland');

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

        console.error(err);

        if (transaction !== null) {
            console.error('rolling back transaction');

            transaction.rollback()
                .then(callback.bind(this,err))
                .catch(function () {
                    console.error('error rolling back transaction');

                    callback(err);
                });
        }
        else {
            callback(err);
        }
    }

    function done() {
        finished = true;

        console.log('inserted ' + processed + ' rows from ' + task.name);
        console.log('commiting transaction');

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

    function processRows(task,cb) {
        if (finished) {
            cb();
            return;
        }

        rows = task.rows;

        if (rows[0].report_id === '') {
            rows[0].report_id = null;
        }
        if (rows[0].report_number === '') {
            rows[0].report_number = null;
        }


        rows[0].model
            .bulkCreate(rows,{
                transaction: transaction
            })
            .then(function () {
                processed += task.rows.length;

                var elapsed = process.hrtime(start)[0];
                
                console.log('processed ' + numeral(processed).format() + ' records in ' +
                        elapsed + ' seconds at ' + Math.round(processed/elapsed) + ' rows/second');

                cb();
            })
            .catch(function (err) {
                if (err.name == 'SequelizeUniqueConstraintError') {
                    console.log('already inserted ' + rows[0].filing_id);
                }
                else {
                    console.error('error inserting ' + rows[0].filing_id + ':');
                    console.log(err);
                }

                cb(err);
            });
    }

    function queueRows(rows,cb) {
        if (finished) {
            cb();
            return;
        }

        var modelGroups = _(rows)
                    .groupBy(function (row) {
                        return row.model.name;
                    })
                    .toArray()
                    .map(function (rows) {
                        return {
                            rows: rows
                        };
                    })
                    .value();

        var q = async.queue(processRows,2);

        q.push(modelGroups,function (err) {
            if (err) {
                q.kill();

                cb(err);
            }
        });

        q.drain = cb;
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

    function processBatch (err, rows, push, next) {
        if (err) {
            push(err);
            next();
        }
        else {
            queueRows(rows,function () {
                push(null,rows);
                next();
            });
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
        console.log('== importing ' + filing_id + ' ==');

        var parse = parser();

        openStream(function (err,stream) {
            if (err) {
                error(err);
                return;
            }

            stream
                .pipe(parse)
                .pipe(highland.pipeline(function (s) {
                    return s.map(processRow)
                        .filter(function (row) {
                            return typeof row.model !== 'undefined';
                        })
                        .batchWithTimeOrCount(5, payload)
                        .consume(processBatch)
                        .stopOnError(error)
                        .done(done);
                }));
        });
    }

    function checkForFiling(id,cb) {
        models.fec_filing.findById(id)
            .then(function (result) {
                if (result) {
                    //console.log('already inserted ' + filing_id);

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
