var _ = require('lodash'),
    async = require('async'),
    fs = require('fs'),
    models  = require('../../models'),
    moment = require('moment'),
    numeral = require('numeral'),
    xlsx = require('xlsx-stream');

var filing_id = 982033;

function moneyFormat(value) {
    return numeral(value).format('0,0.00');
}

function dateFormat(date) {
    return moment(date.coverage_from_date).format('M/D/YYYY');
}

function summaryFormat(filing_id,row,type) {
    var result = [];

    result.push([row.committee_name,'http://docquery.fec.gov/cgi-bin/forms/' + row.filer_committee_id_number + '/' +
            filing_id + '/','http://www.fec.gov/fecviewer/CandidateCommitteeDetail.do?candidateCommitteeId=' +
            row.filer_committee_id_number + '&tabIndex=3']);
        /*
        { v: 'ok', f: 'HYPERLINK("http://docquery.fec.gov/cgi-bin/forms/' + row.filer_committee_id_number + '/' +
            filing_id + '/","This report")'},
        { v: 'ok', f: 'HYPERLINK("http://www.fec.gov/fecviewer/CandidateCommitteeDetail.do?candidateCommitteeId=' +
            row.filer_committee_id_number + '&tabIndex=3","All reports from this committee")' }]);*/
    result.push(['Covering period ' + dateFormat(row.coverage_from_date) +
                    ' through ' + dateFormat(row.coverage_through_date)]);
    result.push(['',
        'Column A This Period',
        'Column B ' + (type == 'pac' ? 'Year' : 'Cycle') + ' to Date']);
    result.push(['Cash on Hand',
        moneyFormat(row.col_a_cash_on_hand_close_of_period)]);
    result.push(['Debts',
        moneyFormat(row.col_a_debts_by)]);
    result.push(['Total Receipts',
        moneyFormat(row.col_a_total_receipts),
        moneyFormat(row.col_b_total_receipts)]);
    if (type == 'pac') {
        result.push(['Independent Expenditures',
            moneyFormat(row.col_a_independent_expenditures),
            moneyFormat(row.col_b_independent_expenditures)]);
    }
    result.push(['Total Disbursements',
        moneyFormat(row.col_a_total_disbursements),
        moneyFormat(row.col_b_total_disbursements)]);

    return result;
}

function getSummary(filing_id,type,cb) {
    models['fec_' + type + '_summary'].findOne({
        where: {
            filing_id: filing_id
        }
    })
    .then(function (summary) {
        if (summary) {
            cb(null,summaryFormat(filing_id,summary.toJSON(),type));
        }
        else {
            cb();
        }
    })
    .catch(cb);
}

function transactionsFormat(transactions) {
    var result = [_.keys(transactions[0].toJSON())];

    return result.concat(transactions.map(function (transaction) {
        return _.values(transaction.toJSON());
    }));
}

function getTransactions(filing_id,type,cb) {
    models['fec_' + type].findAll({
        where: {
            filing_id: filing_id
        },
        limit: 1000000,
        order: [[type + '_amount','DESC']]
    })
    .then(function (transactions) {
        if (transactions && transactions.length > 0) {
            cb(null,transactionsFormat(transactions));
        }
        else {
            cb();
        }
    })
    .catch(cb);
}

function writeSheet(x,name,rows) {
    sheet = x.sheet(name);
    rows.forEach(function (row) {
        sheet.write(row);
    });
    sheet.end();
}

var x = xlsx();
x.pipe(fs.createWriteStream(__dirname + '/../../data/fec/sheets/' + filing_id + '.xlsx'));

async.waterfall([function (cb) {
    getSummary(filing_id,'presidential',function (err,result) {
        if (err) throw err;

        if (typeof result != 'undefined' && result) {
            writeSheet(x,'summary',result);
        }

        cb();
    });
},function (cb) {
    getSummary(filing_id,'pac',function (err,result) {
        if (err) throw err;

        if (typeof result != 'undefined' && result) {
            writeSheet(x,'summary',result);
        }

        cb();
    });
},function (cb) {
    getTransactions(filing_id,'contribution',function (err,result) {
        if (err) throw err;

        if (typeof result != 'undefined' && result) {
            writeSheet(x,'contributions',result);
        }

        cb();
    });
},function (cb) {
    getTransactions(filing_id,'expenditure',function (err,result) {
        if (err) throw err;

        if (typeof result != 'undefined' && result) {
            writeSheet(x,'expenditures',result);
        }

        cb();
    });
}],function () {
    x.finalize();
});
