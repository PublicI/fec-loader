const axios = require('axios'),
    pickup = require('pickup'),
    through2 = require('through2');

module.exports = async options => {
    // const outStream = options.out || process.stdout;

    function processRow(row, enc, next) {
        let filing = {
            // filed_date: row.date.substr(0, 10),
            fec_url: row.link,
            fec_file_id: row.link ? `${row.link
                .replace('http://docquery.fec.gov/dcdev/posted/', '')
                .replace('.fec', '')}` : null,
            committee_name: row.title ? row.title.replace('New filing by ', '') : null
        };

        if (!row.summary) {
            return filing;
        }

        let fields = row.summary.match(
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

        this.push(filing);

        next();
    }

    const fecRSS = axios.create({
        baseURL: 'http://efilingapps.fec.gov/rss/generate'
    });

    let getOptions = {
        params: {
            preDefinedFilingType: 'ALL'
        },
        responseType: 'stream'
    };

    if (options && options.committee) {
        getOptions.params.cids = options.committee;
    }

    const response = await fecRSS.get('', getOptions);

    let data = await response.data;

    return data
        .pipe(pickup({
            objectMode: true
        }))
        .pipe(
            through2.obj(
                processRow
            )
        );
        // .pipe(outStream);
};
