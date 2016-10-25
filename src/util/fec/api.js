var async = require('async'),
    checkForFiling = require('./check'),
    request = require('request'),
    models = require('../../models');

var lookBehind = 100,
    interval = 60000;

function queueFilingsToCheck() {
    console.log('checking API');

    models.fec_filing.findAll({
            attributes: ['filing_id'],
            limit: lookBehind,
            order: [
                ['filing_id', 'DESC']
            ]
        })
        .then(function(filings) {
            filings = filings.map(function(filing) {
                return filing.filing_id;
            });

            request('https://api.open.fec.gov/v1/efile/filings/?sort=-receipt_date&per_page=' +
                    lookBehind + '&api_key=' + process.env.FEC_KEY +
                    '&page=1', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);

                    if (data && data.results) {

                        var tasks = [];

                        data.results.forEach(function (filing) {
                            if (filings.indexOf(filing.file_number) === -1) {
                                tasks.push(filing.file_number);
                            }
                        });

                        async.mapSeries(tasks, checkForFiling, function () {
                            console.log('waiting');
                            setTimeout(queueFilingsToCheck,interval);
                        });
                    }
                }
                else {
                    console.log('waiting');
                    setTimeout(queueFilingsToCheck,interval);
                }
            });

        });
}

queueFilingsToCheck();
