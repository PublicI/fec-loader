var _ = require('lodash'),
    async = require('async'),
    checkForFiling = require('./check'),
    models = require('./models'),
    parser = require('rss-parser'),
    request = require('request');


function queueFilingsToCheck(opts) {
    console.log('checking RSS');

    parser.parseURL('http://efilingapps.fec.gov/rss/generate?preDefinedFilingType=ALL', function(err, parsed) {
        if (!err && parsed && parsed.feed && parsed.feed.entries) {
            const newFilings = parsed.feed.entries.map(filing => parseInt(filing.link.replace('http://docquery.fec.gov/dcdev/posted/','').replace('.fec','')));

            models.fec_filing.findAll({
                    attributes: ['filing_id'],
                    limit: _.min(newFilings),
                    order: [
                        ['filing_id', 'DESC']
                    ]
                })
                .then(filings => {
                    filings = filings.map(filing => filing.filing_id);

                    async.mapSeries(_.difference(newFilings,filings), checkForFiling, function () {
                        console.log('waiting');
                        setTimeout(queueFilingsToCheck.bind(this,opts),opts.interval);
                    });

                });

        }
        else {
            console.error(error);

            console.log('waiting');
            setTimeout(queueFilingsToCheck.bind(this,opts),opts.interval);
        }
    });
}

module.exports = opts => {
    opts = _.defaults(opts,{
        interval: 60000
    });

    queueFilingsToCheck(opts);
};

if (require.main === module) {
    module.exports();
}
