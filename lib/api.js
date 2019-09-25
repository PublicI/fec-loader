const axios = require('axios');

module.exports = async options => {
    if (!options.key) {
        throw new Error('Error: key needed to use FEC API,' +
            'specify using options.key, ' +
            'or get one at https://api.data.gov/signup/');
    }

    const outStream = options.out || process.stdout;

    function processRow(row, enc, next) {
        let filing = JSON.parse(row);

        if (filing.fec_file_id) {
            filing.fec_file_id = parseInt(
                filing.fec_file_id
                    .replace('FEC-', '')
                    .replace('SEN-','')
            );
        }

        this.push(row);

        next();
    }

    const fecAPI = axios.create({
        baseURL: 'https://api.open.fec.gov/v1/',
        params: {
            api_key: options.key
        }
    });

    let endpoint = options.committee ?
        `committee/${options.committee}/filings/` :
        'efile/filings';

    const res = await fecAPI.get(endpoint, {
        params: {
            sort: '-receipt_date',
            per_page: 100,
            page: 1
        },
        responseType: 'stream'
    });

    let data = await response.data;

    return data
        .pipe(
            through2.obj(
                processRow
            )
        );
};
