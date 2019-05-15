const axios = require('axios');

module.exports = async options => {
    if (!options.key) {
        throw new Error('Error: key needed to use FEC API,' +
            'specify using options.key, ' +
            'or get one at https://api.data.gov/signup/');
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
        }
    });

    return res.data.results.map(filing => {
        filing = {
            ...filing
        };

        if (filing.fec_file_id) {
            filing.fec_file_id = parseInt(
                filing.fec_file_id
                    .replace('FEC-', '')
                    .replace('SEN-','')
            );
        }

        return filing;
    });
};
