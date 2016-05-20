var async = require('async'),
    request = require('request'),
    models  = require('../../models'),
    fs = require('fs'),
    filingQueue = require('./import');

var lookAhead = 100,
    lookBehind = 100,
    interval = 3000;

var temp_dir = path.resolve(__dirname + '/../../data/fec/downloaded');

function checkForFiling(filing_id,cb) {
    console.log('checking for ' + filing_id);

    var filePath = temp_dir + '/' + filing_id + '.fec';

    fs.exists(filePath,function (exists) {
        if (!exists) {
           request
                .get('http://docquery.fec.gov/dcdev/posted/' + filing_id + '.fec')
                .on('error', function(err) {
                    console.log(err);

                    setTimeout(cb,interval);
                })
                .on('end',function () {
                    filingQueue.push({
                        name: filing_id,
                        openStream: function (cb) {
                            fs.createReadStream(filePath, cb);
                        }
                    });

                    setTimeout(cb,interval);
                })
                .pipe(fs.createWriteStream(filePath));
        }
        else {
            cb();
        }
    });
}

function queueFilingsToCheck() {
    models.fec_filing.findAll({
        attributes: ['filing_id'],
        limit: lookBehind,
        order: [['filing_id','DESC']]
    })
    .then(function (filings) {
        filings = filings.map(function (filing) {
            return filing.filing_id;
        });

        var q = async.queue(checkForFiling,1);

        for (var i = filings[filings.length-1]; i <= filings[0]+lookAhead; i++) {
            if (filings.indexOf(i) === -1) {
                q.push(i);
            }
        }

        q.drain = queueFilingsToCheck;
    });
}
