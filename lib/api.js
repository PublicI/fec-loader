const fetch = require('cross-fetch');
const through2 = require('through2');
const JSONStream = require('JSONStream');

function processRow(filing, enc, next) {
    if (filing.fec_file_id) {
        filing.fec_file_id = parseInt(
                filing.fec_file_id
                    .replace('FEC-', '')
                    .replace('SEN-',''));

    }

    this.push(filing);

    next();
}

module.exports = async options => {
    if (!options.key) {
        throw new Error('Error: key needed to use FEC API,' +
            'specify using options.key, ' +
            'or get one at https://api.data.gov/signup/');
    }

    const baseURL = options.baseURL || 'https://api.open.fec.gov/v1/';
    const endpoint = options.committee ?
        `committee/${options.committee}/filings/` :
        'efile/filings';

    const params = {
        sort: options.sort || '-receipt_date',
        per_page: options.perPage || 100,
        page: options.page || 1,
        api_key: options.key
    };

    // https://stackoverflow.com/a/34209399
    const query = Object.keys(params)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`) 
        .join('&');

    const response = await fetch(`${baseURL}${endpoint}?${query}`);

    return response.body
        .pipe(JSONStream.parse('results.*'))
        .pipe(
            through2.obj(
                processRow
            )
        );
};
