var _ = require('lodash'),
    async = require('async'),
    filingQueue = require('./import'),
    fs = require('fs'),
    yauzl = require('yauzl');

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

function init(opts) {
    fs.readdir(opts.dir, function(err, files) {
        var q = async.queue(unzipFile, 1);

        files.forEach(function (file) {
            if (file.indexOf('.zip') === -1) {
                return;
            }

            q.push(opts.dir + '/' + file);
        });

        q.drain = function () {
            console.log('done');
        };

    });
}

module.exports = function (opts) {
    opts = _.defaults(opts,{
        dir: __dirname + '/../data/filings'
    });

    init(opts);
};

if (require.main === module) {
    module.exports();
}
