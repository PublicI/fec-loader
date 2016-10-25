var async = require('async'),
    checkForFiling = require('./check'),
    request = require('request'),
    models = require('../../models');

var lookAhead = 10,
    lookBehind = 100;

function queueFilingsToCheck(err,results) {
    // if no results found, look ahead further
    if (typeof results !== 'undefined' && results && Array.isArray(results)) {
        var found = results.filter(function (result) {
            return result;
        }).length;

        if (found > 0) {
            lookAhead = 10;
        }
        else {
            lookAhead += 10;
        }
    }


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

            var tasks = [];

            for (var i = filings[0]-lookBehind; i <= filings[0] + lookAhead; i++) {
                if (filings.indexOf(i) === -1) {
                    tasks.push(i);
                }
            }

            async.mapSeries(tasks, checkForFiling, queueFilingsToCheck);
        });
}

queueFilingsToCheck();
