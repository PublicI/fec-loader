const axios = require('axios'),
    RSSParser = require('rss-parser');

module.exports = async options => {
    const parser = new RSSParser();

    const fecRSS = axios.create({
        baseURL: 'http://efilingapps.fec.gov/rss/generate'
    });

    const res = await fecRSS.get('', {
        params: {
            preDefinedFilingType: 'ALL',
            cids: options.committee
        }
    });

    let { items } = await parser.parseString(res.data);

    function processItem(item) {
        let filing = {
            filed_date: item.date.substr(0, 10),
            fec_url: item.link,
            fec_file_id: item.link ? `${item.link
                .replace('http://docquery.fec.gov/dcdev/posted/', '')
                .replace('.fec', '')}` : null,
            committee_name: item.title ? item.title.replace('New filing by ', '') : null
        };

        if (!item.content) {
            return filing;
        }

        let fields = item.content.match(
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
                ? `${fields[4]
                      .substr(0, 5)
                      .replace('/', '-')}-${fields[4].substr(-4)}`
                : '',
            coverage_end_date: fields[5]
                ? `${fields[5]
                      .substr(0, 5)
                      .replace('/', '-')}-${fields[5].substr(-4)}`
                : '',
            document_description: fields[6]
                ? `${fields[6]} ${fields[5].substr(-4)}`
                : ''
        };

        return filing;
    }

    items = items.map(processItem);

    return items;
};
