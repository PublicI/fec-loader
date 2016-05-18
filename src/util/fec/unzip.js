var async = require('async'),
    fs = require('fs'),
    importFilings = require('./import'),
    yauzl = require('yauzl');

var filings_dir = __dirname + '/../../data/fec/filings';

function unzipFile(file,cb) {
    yauzl.open(file, {
            autoClose: false
        }, function(err, zipfile) {
        if (err) throw err;

        var q = null;

        zipfile.on('entry', function(entry) {
            if (entry.fileName.indexOf('.fec') !== -1) {

                q = importFilings({
                    name: entry.fileName,
                    openStream: function (cb) {
                        zipfile.openReadStream(entry, cb);
                    }
                });

            }
        });

        zipfile.once('end', function () {
            q.drain = function () {
                zipfile.close();

                cb();
            };
        });
    });
}

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
