var request = require('request'),
    fs = require('fs'),
    filingQueue = require('./import'),
    progress = require('progress-stream');

var temp_dir = path.resolve(__dirname + '/../data/downloaded');
var interval = 10000;

module.exports = function (filing_id, cb) {
    var filePath = temp_dir + '/' + filing_id + '.fec';

    fs.exists(filePath, function(exists) {
        if (!exists) {
            console.log('checking ' + filing_id);

            var str = progress({
                time: 100
            });

            var r = request('http://docquery.fec.gov/dcdev/posted/' + filing_id + '.fec');
            r.on('response', function(resp) {
                if (resp.statusCode == 200) {
                    var length = parseInt(resp.headers['content-length']);
                    str.setLength(length);

                    str.on('progress', function(progress) {
                        console.log(progress.percentage + '% transferred');
                    });

                    r.on('error', function(err) {
                            console.log(err);

                            setTimeout(cb.bind(this,null,false), interval);
                        })
                        .pipe(str)
                        .on('end', function() {
                            console.log('downloaded ' + filing_id);

                            if (str.progress().transferred !== length) {
                                console.warn('expecting a file of size ' + length +
                                    ' but downloaded file is ' + str.progress().transferred);
                            }

                            filingQueue.push({
                                name: filing_id + '',
                                openStream: function(cb) {
                                    cb(null, fs.createReadStream(filePath));
                                }
                            });

                            setTimeout(cb.bind(this,null,true), interval);
                        })
                        .pipe(fs.createWriteStream(filePath));
                } else {
                    console.log('not found');
                    setTimeout(cb.bind(this,null,false), interval);
                }
            });
        } else {
            cb(null,false);
        }
    });
};
