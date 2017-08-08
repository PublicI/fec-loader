var _ = require('lodash'),
    async = require('async'),
    checkForFiling = require('./check'),
    models = require('./models'),
    request = require('request');

function queueFilingsToCheck(opts) {
    models.fec_filing.findAll({
            attributes: ['filing_id'],
            limit: opts.lookBehind,
            order: [
                ['filing_id', 'DESC']
            ]
        })
        .then(filings => {
            filings = filings.map(filing => filing.filing_id);

            const tasks = [];

            for (let i = filings[0]-opts.lookBehind; i <= filings[0] + opts.variableLookAhead; i++) {
                if (!filings.includes(i)) {
                    tasks.push(i);
                }
            }

            async.mapSeries(tasks, checkForFiling, (err, results) => {
                // if no results found, look ahead further
                if (typeof results !== 'undefined' && results && Array.isArray(results)) {
                    const found = results.filter(result => result).length;

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

module.exports = opts => {
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
