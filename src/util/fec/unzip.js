var async = require('async'),
    fs = require('fs'),
    filingQueue = require('./import'),
    yauzl = require('yauzl');

var filings_dir = __dirname + '/../../data/fec/paper';

function unzipFile(file,cb) {
    console.log(file);

    yauzl.open(file, {
            autoClose: false
        }, function(err, zipfile) {
        if (err) throw err;

        filingQueue.drain = null;

        zipfile.on('entry', function(entry) {
            if (entry.fileName.indexOf('.fec') !== -1) {

                filingQueue.push({
                    name: entry.fileName,
                    openStream: function (cb) {
                        zipfile.openReadStream(entry, cb);
                    }
                });

            }
        });

        zipfile.once('end', function () {
            filingQueue.drain = function () {
                zipfile.close();

                cb();
            };
        });
    });
}

function init(filings_dir) {
    fs.readdir(filings_dir, function(err, files) {
        var q = async.queue(unzipFile, 1);

        files.forEach(function (file) {
            if (file.indexOf('.zip') === -1) {
                return;
            }

            q.push(filings_dir + '/' + file);
        });

        q.drain = function () {
            console.log('done');
        };

    });
}

init(filings_dir);
