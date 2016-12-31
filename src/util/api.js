var _ = require('lodash'),
    async = require('async'),
    checkForFiling = require('./check'),
    models = require('../models'),
    request = require('request');

function queueFilingsToCheck(opts) {
    console.log('checking API');

    models.fec_filing.findAll({
            attributes: ['filing_id'],
            limit: opts.lookBehind,
            order: [
                ['filing_id', 'DESC']
            ]
        })
        .then(function(filings) {
            filings = filings.map(function(filing) {
                return filing.filing_id;
            });

            request('https://api.open.fec.gov/v1/efile/filings/?sort=-receipt_date&per_page=' +
                    opts.lookBehind + '&api_key=' + process.env.FEC_KEY +
                    '&page=1&cache=' + Math.round(Math.random()*100), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);

                    if (data && data.results) {

                        var tasks = [];

                        data.results.forEach(function (filing) {
                            // console.log(filing.file_number,filings.indexOf(filing.file_number));
                            if (filings.indexOf(filing.file_number) === -1) {
                                tasks.push(filing.file_number);
                            }
                        });

                        async.mapSeries(tasks, checkForFiling, function () {
                            console.log('waiting');
                            setTimeout(queueFilingsToCheck.bind(this,opts),opts.interval);
                        });
                    }
                    else {
                        console.error('no data or results');

                        setTimeout(queueFilingsToCheck.bind(this,opts),opts.interval);
                    }
                }
                else {
                    if (error) {
                        console.error(error);
                    }
                    else {
                        console.error('got ' + response.statusCode + ' response code');
                    }

                    console.log('waiting');
                    setTimeout(queueFilingsToCheck.bind(this,opts),opts.interval);
                }
            });

        });
}

module.exports = function init (opts) {
    opts = _.defaults(opts,{
        lookBehind: 100,
        interval: 60000
    });

    queueFilingsToCheck(opts);
};

if (require.main === module) {
    module.exports();
}
