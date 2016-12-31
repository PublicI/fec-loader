var _ = require('lodash'),
    async = require('async'),
    checkForFiling = require('./check'),
    models = require('../models'),
    request = require('request');

function queueFilingsToCheck(opts) {
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

            var tasks = [];

            for (var i = filings[0]-opts.lookBehind; i <= filings[0] + opts.variableLookAhead; i++) {
                if (filings.indexOf(i) === -1) {
                    tasks.push(i);
                }
            }

            async.mapSeries(tasks, checkForFiling, function (err, results) {
                // if no results found, look ahead further
                if (typeof results !== 'undefined' && results && Array.isArray(results)) {
                    var found = results.filter(function (result) {
                        return result;
                    }).length;

                    if (found > 0) {
                        opts.variableLookAhead = opts.lookAhead;
                    }
                    else {
                        opts.variableLookAhead += opts.lookAhead;
                    }
                }

                queueFilingsToCheck(opts);
            });
        });
}

module.exports = function (opts) {
    opts = _.defaults(opts,{
        lookAhead: 10,
        lookBehind: 1000
    });

    opts.variableLookAhead = opts.lookAhead;

    queueFilingsToCheck(opts);
};

if (require.main === module) {
    module.exports();
}
