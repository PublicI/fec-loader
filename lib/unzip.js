var _ = require('lodash'),
    async = require('async'),
    filingQueue = require('./import'),
    fs = require('fs'),
    yauzl = require('yauzl');

function unzipFile(file,cb) {
    console.log(file);

    yauzl.open(file, {
            autoClose: false
        }, (err, zipfile) => {
        if (err) throw err;

        filingQueue.drain = null;

        zipfile.on('entry', entry => {
            if (entry.fileName.includes('.fec')) {

                filingQueue.push({
                    name: entry.fileName,
                    openStream(cb) {
                        zipfile.openReadStream(entry, cb);
                    }
                });

            }
        });

        zipfile.once('end', () => {
            filingQueue.drain = () => {
                zipfile.close();

                cb();
            };
        });
    });
}

function init(opts) {
    fs.readdir(opts.dir, (err, files) => {
        const q = async.queue(unzipFile, 1);

        files.forEach(file => {
            if (!file.includes('.zip')) {
                return;
            }

            q.push(`${opts.dir}/${file}`);
        });

        q.drain = () => {
            console.log('done');
        };

    });
}

module.exports = opts => {
    opts = _.defaults(opts,{
        dir: `${__dirname}/../data/filings`
    });

    init(opts);
};

if (require.main === module) {
    module.exports();
}
