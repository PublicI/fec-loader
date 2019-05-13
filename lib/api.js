const fetch = require('cross-fetch');

module.exports = async (options) => {
    const apiUrl = `https://api.open.fec.gov/v1/efile/filings/?sort=-receipt_date&per_page=100&api_key=${
        options.fec_key ? options.fec_key : ''
    }&page=1&cache=${Math.round(Math.random() * 100)}`;

    try {
        const res = await fetch(apiUrl);

        if (res.status >= 400) {
            throw new Error('Bad response from server');
        }

        const data = await res.json();

        let filings = data.results.map(filing => filing.fec_url);

        console.log(filings.join('\n'));
    } catch (err) {
        console.error(err);
    }
}
