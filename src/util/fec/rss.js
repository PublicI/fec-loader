var async = require('async'),
    checkForFiling = require('./check'),
    request = require('request'),
    models = require('../../models'),
    FeedParser = require('feedparser');

var lookBehind = 100,
    interval = 60000;

function queueFilingsToCheck() {
    console.log('checking RSS');

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

            request('http://efilingapps.fec.gov/rss/generate?preDefinedFilingType=ALL')
                .on('error', function(error) {
                    console.error(error);
                })
                .on('response', function(res) {
                    var stream = this;

                    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

                    var feedparser = new FeedParser();

                    stream.pipe(feedparser);

                    feedparser
                        .on('error', function(error) {
                            console.error(error);
                        })
                        .on('readable', function() {
                            var stream = this,
                                item,
                                tasks = [];

                            while (item = stream.read()) {
                                var id = parseInt(item.link.replace('http://docquery.fec.gov/dcdev/posted/','').replace('.fec',''));

                                if (filings.indexOf(id) === -1) {
                                    tasks.push(id);
                                }
                            }

                            console.log(tasks)
/*
                            async.mapSeries(tasks, checkForFiling, function() {
                                console.log('waiting');
                                setTimeout(queueFilingsToCheck, interval);
                            });*/
                        });
                });

        });
}

queueFilingsToCheck();
