const fetch = require('cross-fetch');
const pickup = require('pickup');
const map = require('through2-map').obj;

function processRow(row) {
    if (row.constructor.name == 'Feed') {
        return null;
    }

    let filing = {
        // filed_date: row.date.substr(0, 10),
        fec_url: row.link,
        fec_file_id: row.link
            ? `${row.link
                  .replace('http://docquery.fec.gov/dcdev/posted/', '')
                  .replace('.fec', '')}`
            : null,
        committee_name: row.title
            ? row.title.replace('New filing by ', '')
            : null
    };

    if (!row.summary) {
        return filing;
    }

    const fields = row.summary.match(
        /\*\*\*\*\*\*\*\*\*CommitteeId: (.*) \| FilingId: (.*) \| FormType: (.*) \| CoverageFrom: (.*) \| CoverageThrough: (.*) \| ReportType: (.*)\*\*\*\*\*\*\*\*\*$/
    );

    if (!fields) {
        return filing;
    }

    filing = {
        ...filing,
        committee_id: fields[1],
        form_type: fields[3],
        coverage_start_date: fields[4]
            ? `${fields[4].substr(0, 5).replace('/', '-')}-${fields[4].substr(
                  -4
              )}`
            : '',
        coverage_end_date: fields[5]
            ? `${fields[5].substr(0, 5).replace('/', '-')}-${fields[5].substr(
                  -4
              )}`
            : '',
        document_description: fields[6]
            ? `${fields[6]} ${fields[5].substr(-4)}`
            : ''
    };

    return filing;
}

module.exports = async options => {
    const baseURL =
        options.baseURL || 'http://efilingapps.fec.gov/rss/generate';

    const params = {
        preDefinedFilingType: options.filingType || 'ALL'
    };

    if (options && options.committee) {
        params.cids = options.committee;
    }

    // https://stackoverflow.com/a/34209399
    const query = Object.keys(params)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');

    const response = await fetch(`${baseURL}?${query}`);

    return response.body
        .pipe(
            pickup({
                objectMode: true
            })
        )
        .pipe(map(processRow));
};
