var Slack = require('slack-client'),
    fs = require('fs'),
    models = require('../../models'),
    moment = require('moment');

slack = new Slack(process.env.SLACK_TOKEN, true, true);

var filing_lookup = {};

function checkForFilings (channel,type,first_run) {
    console.log('checking ' + (first_run ? 'first run' : 'not first run'));
    models['fec_' + type + '_summary'].findAll({
        attributes: ['filing_id','committee_name','filer_committee_id_number','form_type'],
        logging: console.log,
        where: {
            created_date: {
                $gte: moment().subtract(60,'minutes').toDate()
            }
        }
    })
    .then(function (filings) {
        console.log('found ' + filings.length);

        filings.forEach(function (filing) {
            filing = filing.toJSON();

            if (!(filing.filing_id in filing_lookup) && !first_run) {
                console.log(filing.committee_name + ' (' + filing.filer_committee_id_number + ') filed a ' + filing.form_type);
                channel.send(filing.committee_name + ' (' + filing.filer_committee_id_number + ') filed a ' + filing.form_type + ' http://docquery.fec.gov/cgi-bin/forms/' + filing.filer_committee_id_number + '/' + filing.filing_id + '/');
            }

            filing_lookup[filing.filing_id] = true;
        });
    });
}


slack.on('open', function() {
    var channel = slack.getChannelGroupOrDMByID('C0C8S4TQC');

    checkForFilings(channel,'pac',true);
    checkForFilings(channel,'presidential',true);

    setInterval(function () {
        checkForFilings(channel,'pac',false);
        checkForFilings(channel,'presidential',false);
    },1000*10);
});

slack.login();
