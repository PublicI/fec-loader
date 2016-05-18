var models  = require('../../models'),
    async = require('async'),
    JSONStream = require('JSONStream'),
    _ = require('lodash');

var payload = 200; // how many rows get processed by cargo at a time

var formModels = [
    models.fec_filing,
    models.fec_presidential_summary,
    models.fec_pac_summary,
    models.fec_group_summary,
    models.fec_contribution,
    models.fec_expenditure,
    models.fec_ie
];

function processRows(task,cb) {
    rows = task.rows;

    if ('report_id' in rows[0] && rows[0].report_id === '') {
        rows[0].report_id = null;
    }

    console.log(formModels[rows[0].model_index],rows.length);

    formModels[rows[0].model_index]
        .bulkCreate(rows)
        .then(cb)
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
    var modelGroups = _(rows)
                .groupBy('model_index')
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

function modelIndex(row) {
    var index = null;

    for (var i = 0; i < formModels.length; i++) {
        if (formModels[i].match(row)) {
            index = i;
            break;
        }
    }

    return index;
}

function processFiling(file, cb) {
    var filing_id = file.name.replace('.json',''); // assume the file name is [filing_id].json

    console.log('== importing ' + filing_id + ' ==');

    var pipe = fs.createReadStream(file.path + '/' + file.name)
                    .pipe(JSONStream.parse('rows.*'));

    var cargo = async.cargo(queueRows,payload);

    console.log('pausing cargo');
    cargo.pause();

    var i = 0,
        error = null,
        calledback = false;

    pipe
        .on('data',function (row) {
            row.filing_id = filing_id;
            row.model_index = modelIndex(row);

            if (row.model_index !== null) {
                cargo.push(row,function (err) {
                    if (err) {
                        console.log('import error');
                        // console.log(err);
                        console.log('killing cargo');
                        cargo.kill();

                        error = err;
                    }
                });
            }

            if (i === 1 && (row.model_index !== null ||
                (row.form_type && row.form_type.match(/^(F24)/)))) {

                console.log('resuming cargo');
                cargo.resume();
                console.log(cargo);
            }
            else if (i === 1) {
                console.log('killing cargo');
                cargo.kill();
            }

            i++;
        })
        .on('end',function () {
            console.log('stream ended');

            if (cargo.length() === 0) {
                console.log('== imported ' + filing_id + ' ==');
                cb(error);
            }
            else {
                cargo.drain = function () {
                    console.log('cargo drained');
                    console.log('== imported ' + filing_id + ' ==');
                    cb(error);
                };
            }
        })
        .on('error',function (err) {
            console.log('stream error');
            console.log('killing cargo');
            cargo.kill();

            console.error(err);

            cb();
        });
}


function init(path,cb) {
    // cycle through the filings, add them to the process queue
    fs.readdir(path, function(err, files) {
        if (err) throw err;

        var q = async.queue(processFiling, 1);

        files.reverse().forEach(function(file) {
            if (file.indexOf('.json') !== -1) {
                q.push({
                    path: path,
                    name: file
                });
            }
        });

        q.drain = cb;

    });
}

if (require.main === module) {
    var basePath = __dirname + '/../../data/';

    init(basePath + 'fec/parsed',function (err) {
        console.log(err);

        console.log('done');
    });
}

module.exports = init;

