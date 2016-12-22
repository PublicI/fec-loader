var _ = require('lodash'),
    async = require('async'),
    checkForFiling = require('./check'),
    request = require('request'),
    models = require('../models'),
    parser = require('rss-parser');

var interval = 60000;

function queueFilingsToCheck() {
    console.log('checking RSS');


    parser.parseURL('http://efilingapps.fec.gov/rss/generate?preDefinedFilingType=ALL', function(err, parsed) {
        if (!err && parsed && parsed.feed && parsed.feed.entries) {
            var newFilings = parsed.feed.entries.map(function (filing) {
                return parseInt(filing.link.replace('http://docquery.fec.gov/dcdev/posted/','').replace('.fec',''));
            });

            models.fec_filing.findAll({
                    attributes: ['filing_id'],
                    limit: _.min(newFilings),
                    order: [
                        ['filing_id', 'DESC']
                    ]
                })
                .then(function(filings) {
                    filings = filings.map(function(filing) {
                        return filing.filing_id;
                    });

                    async.mapSeries(_.difference(newFilings,filings), checkForFiling, function () {
                        console.log('waiting');
                        setTimeout(queueFilingsToCheck,interval);
                    });

                });

        }
        else {
            console.error(error);

            console.log('waiting');
            setTimeout(queueFilingsToCheck,interval);
        }
    });
}

queueFilingsToCheck();
