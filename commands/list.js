const { api, rss, format } = require('../');

module.exports = {
    command: 'list',
    describe: 'Show a list of the latest e-filings from the FEC API or RSS feed.',
    builder: {
        key: {
            type: 'string',
            alias: 'fecKey',
            describe:
                'data.gov API key authorizing access to the FEC API, can set using environment variable FEC_KEY'
        },
        rss: {
            type: 'boolean',
            default: false,
            describe: 'use the FEC RSS feed as the source'
        },
        committee: {
            type: 'string',
            describe: 'ID of a committee for which to show filings'
        },
        format: {
            type: 'string',
            default: 'table',
            choices: ['table','ndjson','json','csv','tsv'],
            describe: 'choose output format'
        },
        headers: {
            type: 'boolean',
            default: true,
            describe: 'show column headers'
        },
        columns: {
            type: 'string',
            describe: 'choose columns to show'
        },
        columnLength: {
            type: 'integer',
            default: 30,
            describe:
                'how many characters to show in each table cell'
        }
    },
    handler: async options => {
        if (!options.rss && !options.key) {
            console.error(
                'Error: key needed to use FEC API, ' +
                    'specify using --key or the FEC_KEY environment variable, ' +
                    'get one at https://api.data.gov/signup/' +
                    'or use --rss instead'
            );
            return;
        }

        const columns = options.columns
            ? options.columns.split(',')
            : options.format == 'table'
            ? [
                  'fec_file_id',
                  'form_type',
                  'coverage_end_date',
                  'committee_id',
                  'committee_name'
              ]
            : null;

        try {
            let filings = await (options.rss ? rss : api)(options);

            console.log(
                format(filings, options.format, columns, options.headers, options.columnLength)
            );
        } catch (err) {
            console.error(err);
        }
    }
};
