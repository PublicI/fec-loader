const fec = require('../');

module.exports = {
    command: 'convert',
    describe:
        'Pipe in an .fec file to convert it to newline-delimited JSON or psql COPY commands.',
    builder(yargs) {
        return yargs
            .positional('filing_id', {
                describe: 'the filing ID of the filing'
            })
            .options({
                format: {
                    type: 'string',
                    default: 'ndjson',
                    choices: ['ndjson', 'psql'],
                    describe: 'choose output format'
                }
            });
    },
    handler(options) {
        fec[options.format](options);
    }
};
