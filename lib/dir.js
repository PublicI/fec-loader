var _ = require('lodash'),
    fs = require('fs'),
    filingQueue = require('./import');

function init(opts) {
    fs.readdir(opts.dir, (err, files) => {
        if (err) throw err;

        filingQueue.drain = null;

        files.forEach(file => {
            if (!file.includes('.fec')) {
                return;
            }

            filingQueue.push({
                name: file,
                openStream(cb) {
                    cb(null,fs.createReadStream(`${opts.dir}/${file}`));
                }
            });
        });

        filingQueue.drain = () => {
            console.log('done');
        };

    });
}

module.exports = opts => {
    opts = _.defaults(opts,{
        dir: `${__dirname}/../data/downloaded`
    });

    init(opts);
};

if (require.main === module) {
    module.exports();
}