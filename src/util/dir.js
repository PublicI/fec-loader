var _ = require('lodash'),
    fs = require('fs'),
    filingQueue = require('./import');

function init(opts) {
    fs.readdir(opts.dir, function(err, files) {
        if (err) throw err;

        filingQueue.drain = null;

        files.forEach(function (file) {
            if (file.indexOf('.fec') === -1) {
                return;
            }

            filingQueue.push({
                name: file,
                openStream: function (cb) {
                    cb(null,fs.createReadStream(opts.dir + '/' + file));
                }
            });
        });

        filingQueue.drain = function () {
            console.log('done');
        };

    });
}

module.exports = function (opts) {
    opts = _.defaults(opts,{
        dir: __dirname + '/../data/downloaded'
    });

    init(opts);
};

if (require.main === module) {
    module.exports();
}