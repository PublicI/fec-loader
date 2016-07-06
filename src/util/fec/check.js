var async = require('async'),
    request = require('request'),
    models  = require('../../models'),
    fs = require('fs'),
    filingQueue = require('./import');

var lookAhead = 100,
    lookBehind = 25,
    interval = 10000;

var temp_dir = path.resolve(__dirname + '/../../data/fec/downloaded');

function checkForFiling(filing_id,cb) {
    var filePath = temp_dir + '/' + filing_id + '.fec';

    fs.exists(filePath,function (exists) {
        if (!exists) {
            console.log('checking ' + filing_id);

            var r = request('http://docquery.fec.gov/dcdev/posted/' + filing_id + '.fec');
            r.on('response', function (resp) {
                if (resp.statusCode == 200) {
                    var length = resp.headers['content-length'];

                    r.on('error', function(err) {
                        console.log(err);

                        setTimeout(cb,interval);
                    })
                    .on('end',function () {
                        console.log('downloaded ' + filing_id);

                        fs.stat(filePath,function (err,stats) {
                            if (err) {
                                console.error('unable to stat file',err);
                            }

                            if (stats.size !== length) {
                                console.error('expecting a file of size ' + length + ' but downloaded file is ' + stats.size);
                            }

                            filingQueue.push({
                                name: filing_id + '',
                                openStream: function (cb) {
                                    cb(null,fs.createReadStream(filePath));
                                }
                            });

                        });

                        setTimeout(cb,interval);
                    })
                    .pipe(fs.createWriteStream(filePath));
                }
                else {
                    console.log('not found');
                    setTimeout(cb,interval);
                }
            });
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

queueFilingsToCheck();
