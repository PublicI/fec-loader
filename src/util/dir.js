var fs = require('fs'),
    filingQueue = require('./import');

var filings_dir = __dirname + '/../data/downloaded';

function init(filings_dir) {
    fs.readdir(filings_dir, function(err, files) {
        if (err) throw err;

        filingQueue.drain = null;

        files.forEach(function (file) {
            if (file.indexOf('.fec') === -1) {
                return;
            }

            filingQueue.push({
                name: file,
                openStream: function (cb) {
                    fs.createReadStream(filings_dir + '/' + file, cb);
                }
            });
        });

        filingQueue.drain = function () {
            console.log('done');
        };

    });
}

init(filings_dir);
