const axios = require('axios');
const through2 = require('through2');
const JSONStream = require('JSONStream');

function processRow(filing, enc, next) {
    if (filing.fec_file_id) {
        filing.fec_file_id = parseInt(
            filing.fec_file_id
                .replace('FEC-', '')
                .replace('SEN-','')
        );
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

    const outStream = options.out || process.stdout;
    const baseURL = options.baseURL || 'https://api.open.fec.gov/v1/';
    const sort = options.sort || '-receipt_date';
    const perPage = options.perPage || 100;
    const page = options.page || 1;
    const endpoint = options.committee ?
        `committee/${options.committee}/filings/` :
        'efile/filings';
    const apiKey = options.key;

    const fecAPI = axios.create({
        baseURL
    });

    const response = await fecAPI.get(endpoint, {
        params: {
            sort,
            per_page: perPage,
            page,
            api_key: apiKey
        },
        responseType: 'stream'
    });

    return response.data
        .pipe(JSONStream.parse('results.*'))
        .pipe(
            through2.obj(
                processRow
            )
        );
};
