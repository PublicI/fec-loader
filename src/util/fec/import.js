var models  = require('../../models'),
    async = require('async'),
    numeral = require('numeral'),
    parser = require('fec-parse'),
    _ = require('lodash'),
    brake = require('brake');

var payload = 200; // how many rows get processed by cargo at a time

var formModels = [
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
        queued = 0,
        finished = false;

    function error(err) {
        cargo.kill();

        if (!finished) {
            finished = true;

            notify('importFailed',{ filing_id: filing_id });

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
        else {
            throw new Error('error called for ' + filing_id + ', but already finished');
        }
    }

    function done() {
        if (processed == queued && !finished) {
            finished = true;

            console.log('inserted ' + processed + ' rows from ' + task.name);
            console.log('commiting transaction');

            transaction.commit()
                .then(function (result) {
                    notify('importComplete',{ filing_id: filing_id });

                    callback(null,result);
                })
                .catch(error);
        }
        else if (finished) {
            throw new Error('done called for ' + filing_id + ', but already finished');
        }
        else if (processed !== queued) {
            throw new Error('done called for ' + filing_id + ', but processed is ' + processed + ' and queued is ' + queued);
        }
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

        console.log('processing ' + numeral(processed).format() + ' - ' + numeral(processed+task.rows.length).format() + ' of ' + numeral(queued).format());

        rows[0].model
            .bulkCreate(rows,{
                transaction: transaction
            })
            .then(function () {
                processed += task.rows.length;

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

        var q = async.queue(processRows,1);

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
            if (data.coverage_from_date) {
                data = _.pick(data,[
                    'filing_id',
                    'form_type',
                    'committee_name',
                    'organization_name',
                    'filer_committee_id_number',
                    'coverage_from_date',
                    'coverage_through_date']);
            }
            
            return models.sequelize.query('NOTIFY fec:' + channel + ', $json;',{
                bind: { json: JSON.stringify(data) }
            });
        }
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
                .pipe(brake(45164*3))
                .pipe(parse)
                .on('data',function (row) {
                    row.filing_id = filing_id;
                    row.model = formModels.find(function (model) {
                        return model.match(row);
                    });

                    if (typeof row.model !== 'undefined' && !finished) {
                        queued++;

                        if (queued == 2 && row.coverage_from_date) {
                            notify('importStart',row);
                        }

                        cargo.push(row,function (err) {
                            if (err) {
                                error();
                            }
                        });
                    }

                })
                .on('end',function () {
                    cargo.drain = done;

                    if (processed === queued) {
                        done();
                    }
                })
                .on('error',error);
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

    var cargo = async.cargo(queueRows,payload);

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
