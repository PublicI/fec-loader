var async = require('async'),
    request = require('request'),
    models  = require('../../models'),
    fs = require('fs'),
    filingQueue = require('./import'),
    progress = require('progress-stream');

var lookAhead = 100,
    lookBehind = 25,
    interval = 10000;

var temp_dir = path.resolve(__dirname + '/../../data/fec/downloaded');

function checkForFiling(filing_id,cb) {
    var filePath = temp_dir + '/' + filing_id + '.fec';

    fs.exists(filePath,function (exists) {
        if (!exists) {
            console.log('checking ' + filing_id);

            var str = progress({
                time: 10000
            });

            var r = request('http://docquery.fec.gov/dcdev/posted/' + filing_id + '.fec');
            r.on('response', function (resp) {
                if (resp.statusCode == 200) {
                    str.setLength(parseInt(resp.headers['content-length']));

                    r.on('error', function(err) {
                        console.log(err);

                        setTimeout(cb,interval);
                    })
                    .on('end',function () {
                        console.log('downloaded ' + filing_id);

                        if (str.progress.transferred !== str.progress.length) {
                            console.warn('expecting a file of size ' + str.progress.length + ' but downloaded file is ' + str.progress.transferred);
                        }

                        filingQueue.push({
                            name: filing_id + '',
                            openStream: function (cb) {
                                cb(null,fs.createReadStream(filePath));
                            }
                        });

                        setTimeout(cb,interval);
                    })
                    .on('progress',function (progress) {
                        console.log(progress.percentage + '% transferred');
                    })
                    .pipe(str)
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
