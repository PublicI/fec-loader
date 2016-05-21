var Slack = require('slack-client'),
    fs = require('fs'),
    models = require('../../models'),
    moment = require('moment');
    // sheet = require('./sheet');

var committees = ['C00004036',
    'C00298000',
    'C00388934',
    'C00406553',
    'C00430819',
    'C00448373',
    'C00458844',
    'C00487363',
    'C00487470',
    'C00490045',
    'C00490409',
    'C00493924',
    'C00495861',
    'C00499335',
    'C00499525',
    'C00499731',
    'C00500025',
    'C00500587',
    'C00501098',
    'C00503417',
    'C00504241',
    'C00505081',
    'C00506055',
    'C00507525',
    'C00507707',
    'C00508002',
    'C00508317',
    'C00508721',
    'C00525220',
    'C00525899',
    'C00528307',
    'C00532572',
    'C00536540',
    'C00538827',
    'C00540898',
    'C00540997',
    'C00541292',
    'C00543157',
    'C00544569',
    'C00548420',
    'C00554725',
    'C00555615',
    'C00559237',
    'C00559765',
    'C00564534',
    'C00566497',
    'C00567685',
    'C00568840',
    'C00569905',
    'C00570325',
    'C00570739',
    'C00571356',
    'C00571372',
    'C00571380',
    'C00571588',
    'C00571711',
    'C00571778',
    'C00571950',
    'C00572537',
    'C00572867',
    'C00573055',
    'C00573154',
    'C00573519',
    'C00573634',
    'C00573733',
    'C00573816',
    'C00573923',
    'C00574277',
    'C00574418',
    'C00574533',
    'C00574624',
    'C00575373',
    'C00575415',
    'C00575423',
    'C00575431',
    'C00575449',
    'C00575795',
    'C00576108',
    'C00577130',
    'C00577312',
    'C00577916',
    'C00577981',
    'C00578245',
    'C00578492',
    'C00578658',
    'C00578724',
    'C00578757',
    'C00578997',
    'C00579458',
    'C00579706',
    'C00580092',
    'C00580100',
    'C00580159',
    'C00580324',
    'C00580373',
    'C00580399',
    'C00580480',
    'C00580969',
    'C00581215',
    'C00581868',
    'C00581876',
    'C00582197',
    'C00582668',
    'C00582973',
    'C00583146',
    'C00586826',
    'C00587022',
    'C00591214',
    'C00592337',
    'C00603621',
    'C00608984',
    'C00609511',
    'C90011909',
    'C90015181',
    'C90015439',
    'C90015587'];

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

            if (!(filing.filing_id in filing_lookup) && !first_run && committees.indexOf(filing.filer_committee_id_number) !== -1) {
                // sheet(filing.filing_id);

                console.log(filing.committee_name + ' (' + filing.filer_committee_id_number + ') filed a ' + filing.form_type);
                channel.send(filing.committee_name + ' (' + filing.filer_committee_id_number + ') filed a ' + filing.form_type + ' http://docquery.fec.gov/cgi-bin/forms/' + filing.filer_committee_id_number + '/' + filing.filing_id + '/');
                // for the period ending ' + moment(filing.coverage_through_date).format('MM/DD/YYYY')  + '
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
