const parser = require('fec-parse'),
    through2 = require('through2');

module.exports = (options) => {
    const parse = parser();

    const filing_id = options.filing_id;
    const inStream = options.in || process.stdin;
    const outStream = options.out || process.stdout;

    function processRow(row, enc, next) {
        row.filing_id = filing_id;

        if ('report_id' in row && row.report_id) {
            row.report_id = parseInt(row.report_id.replace('FEC-', '').replace('SEN-',''));
        }
        
        this.push(`${JSON.stringify(row)}\n`);

        next();
    }

    return inStream.pipe(parser())
        .pipe(
            through2.obj(
                processRow
            )
        )
        .pipe(outStream);
}
