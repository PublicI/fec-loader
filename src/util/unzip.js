var exec = require('child_process').exec,
    queue = require('queue-async'),
    fs = require('fs'),
    path = require('path'),
    // extract = require('extract-zip'),
    yauzl = require('yauzl'),
    parser = require('fec-parse'),
    _ = require('lodash'),
    models  = require('../../models');

var temp_dir = path.resolve(__dirname + '/../../data/fec/temp');
var filings_dir = path.resolve(__dirname + '/../../data/fec/filings');
var parsed_dir = path.resolve(__dirname + '/../../data/fec/parsed');

function unzipFile(file,cb) {
    yauzl.open(file, {
            autoClose: false
        }, function(err, zipfile) {
        if (err) throw err;

        var q = queue(1);

        zipfile.on('entry', function(entry) {
            if (entry.fileName.indexOf('.fec') !== -1) {
                q.defer(function (entry,cb2) {
                    var filingId = entry.fileName.replace('.fec','');

                    fs.exists(parsed_dir + '/' + filingId + '.json',function (exists) {
                        if (!exists) {

                            zipfile.openReadStream(entry, function(err, readStream) {
                                if (err) {
                                    cb2(err);
                                    return;
                                }

                                var count = 0,
                                    file = null,
                                    firstCb = true,
                                    parse = parser(),
                                    buffer = '',
                                    write = false;

                                readStream
                                    .pipe(parse)
                                    .on('data', function(row) {
                                        if (row) {
                                            if (count === 0) {
                                                buffer = '{\r\n  \"rows\": [  \r\n    ';
                                                buffer += JSON.stringify(row,null,'      ').replace('}','    }');
                                            }
                                            else if (count === 1) {
                                                if ('form_type' in row && (row.form_type.match(/^(F24|F5)/) ||
                                                    committeeIDs.indexOf(row.filer_committee_id_number) !== -1)) {
                                                    console.log('parsing ' + filingId + '.fec');

                                                    file = fs.createWriteStream(parsed_dir + '/' + filingId + '.json');

                                                    buffer += ',\r\n    ';
                                                    buffer += JSON.stringify(row,null,'      ').replace('}','    }');

                                                    file.write(buffer);

                                                    write = true;
                                                }
                                            }
                                            else if (write) {
                                                file.write(',\r\n    ');

                                                file.write(JSON.stringify(row,null,'      ').replace('}','    }'));
                                            }

                                            count++;
                                        }
                                    })
                                    .on('error',function (e) {
                                        if (firstCb &&
                                            e.message != 'Row type was undefined' &&
                                            e.message != 'Couldn\'t find header mapping') {

                                            cb2(null);
                                            firstCb = false;
                                        }
                                    })
                                    .on('finish',function () {
                                        if (write) {
                                            file.write('\r\n  ]\r\n}\r\n');
                                            file.end();
                                        }

                                        if (firstCb) {
                                            cb2(null);
                                            firstCb = false;
                                        }
                                    });

                            });
                        }
                        else {
                            console.log('skipping',filingId);

                            cb2();
                        }

                    });

                },entry);
            }
        });

        zipfile.once('end', function () {
            q.awaitAll(function () {
                zipfile.close();

                cb();
            });
        });
    });
}

var committeeIDs = [];

models.cpi_group.getCommittees(models,function (err,committees) {
    committeeIDs = _.pluck(committees,'id');

    fs.readdir(filings_dir, function(err, files) {
        var q = queue(1);

        files.forEach(function (file) {
            if (file.indexOf('.zip') === -1) {
                return;
            }

            q.defer(function (file2,cb) {
                console.log('unzipping ' + file2);
                unzipFile(file2,cb);
            },filings_dir + '/' + file);
        });

        q.awaitAll(function () {
            console.log('done');
        });

    });
});
