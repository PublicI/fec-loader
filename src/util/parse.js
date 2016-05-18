var fs = require('fs'),
    _ = require('lodash'),
    queue = require('queue-async'),
    parser = require('fec-parse'),
    models  = require('../../models');

var temp_dir = path.resolve(__dirname + '/../../data/fec/downloaded');
var parsed_dir = path.resolve(__dirname + '/../../data/fec/parsed');

function parseFiling(filename,cb) {
    var filingId = filename.replace('.fec','');

    fs.exists(parsed_dir + '/' + filingId + '.json',function (exists) {
        if (!exists) {
            // console.log('parsing ' + filingId + '.fec');

            var count = 0;

            var file = null;

            var firstCb = true;

            var parse = parser();

            var buffer = '';

            var write = false;

            fs.createReadStream(temp_dir + '/' + filingId + '.fec')
                .pipe(parse)
                .on('data', function(row) {
                    if (row) {
                        if (count === 0) {
                            buffer = '{\r\n  \"rows\": [  \r\n    ';
                            buffer += JSON.stringify(row,null,'      ').replace('}','    }');
                        }
                        else if (count === 1) {
                            if ('form_type' in row && (row.form_type.match(/^(F24|F5)/) ||
                                commmitteeIDs.indexOf(row.filer_committee_id_number) !== -1)) {
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
//                               console.log(e);
                        cb(null);
                        firstCb = false;
                    }
                })
                .on('finish',function () {
                    if (write) {
                        file.write('\r\n  ]\r\n}\r\n');
                        file.end();
                    }
//                            console.log('parsed ' + count + ' rows');

                    if (firstCb) {
                        cb(null);
                        firstCb = false;
                    }
                });
        }
        else {
            console.log('skipping ' + filingId + ' because parsed file exists');

            cb(null);
        }
    });

}

function parseDir(dir,cb) {
    var q = queue(1);

    fs.readdir(dir,function (err,files) {
        files.forEach(function (filename) {
            if (filename.indexOf('.fec') === -1) {
                return;
            }

            q.defer(parseFiling,filename);

        });

        q.awaitAll(function () {
            cb();
        });

    });
}

var commmitteeIDs = [];

if (require.main === module) {
    models.cpi_group.getCommittees(models,function (err,committees) {
        commmitteeIDs = _.pluck(committees,'id');

        parseDir(temp_dir,function () {

        });
    });
}

module.exports = function (dir,cb) {
    models.cpi_group.getCommittees(models,function (err,committees) {
        commmitteeIDs = _.pluck(committees,'id');

        parseDir(dir,cb);
    });
};

