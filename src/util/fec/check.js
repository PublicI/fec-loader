var request = require('request'),
    _ = require('lodash'),
    queue = require('queue-async'),
    fs = require('fs'),
    parse = require('./parse'),
    importFilings = require('./import'),
    models = require('../../models'),
    moment = require('moment');

var key = 'hJ3L2UDRQr6TxYg16lfVXCgiiYvyVhP3NL9mEQI3';

function check(cb) {
    console.log('checking ' + moment().format('YYYY/MM/DD'));
    var found = false;

    var url = 'https://api.propublica.org/campaign-finance/v1/2016/filings/' + moment().format('YYYY/MM/DD') + '.json';

    request({url: url, headers: {'X-API-Key':key}}, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var res = JSON.parse(body);

            var q = queue(1);

            res.results.forEach(function (result) {
                if (commmitteeIDs.indexOf(result.fec_committee_id) !== -1) {
                    q.defer(function (filing_id,cb) {

                        var filePath = __dirname + '/../../data/fec/downloaded/' + filing_id + '.fec';

                        fs.exists(filePath,function (exists) {
                            if (!exists) {
                                console.log('downloading ' + filing_id);
                                found = true;

                                request
                                    .get('http://docquery.fec.gov/dcdev/posted/' + filing_id + '.fec')
                                    .on('error', function(err) {
                                        console.log(err);
                                    })
                                    .on('end',function () {
                                        setTimeout(cb,10000);
                                    })
                                    .pipe(fs.createWriteStream(filePath));
                            }
                            else {
                                console.log(filing_id + ' not downloaded, already exists');
                                cb();
                            }
                        });


                    },result.filing_id);
                }
            });

            q.awaitAll(function () {
                if (found) {
                    parse(__dirname + '/../../data/fec/downloaded/',function () {
                        importFilings(function () {
                            console.log('waiting');
                            setTimeout(cb,1000*60*2);
                        });
                    });
                }
                else {
                    console.log('nothing found');
                    setTimeout(cb,1000*60*2);
                }
            });


        }
        else {
            console.error(error);

            setTimeout(cb,1000*60*2);
        }
    });
}

var commmitteeIDs = [];

function init() {
    models.cpi_group.getCommittees(models,function (err,committees) {
        commmitteeIDs = _.pluck(committees,'id');

        check(init);
    });
}

init();

