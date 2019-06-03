const table = require('table'),
    csv = require('fast-csv'),
    through2 = require('through2');

module.exports = (stream, format, columns, headers = true, maxLength = 30) => {
    switch (format) {
        case 'json':
            let initial = true;

            return stream
                .pipe(
                    through2(
                        { objectMode: true },
                        function (row, enc, next) {
                            if (initial) {
                                this.push('{"rows":');
                            }

                            this.push(`${JSON.stringify(row)},\n`);

                            next();
                        },
                        function () {
                            this.push(']}');

                            cb();
                        })
                );
        case 'ndjson':
            return stream
                .pipe(
                    through2.obj(
                        (row, enc, next) => {
                            this.push(`${JSON.stringify(row)}\n`);

                            next();
                        }
                    )
                );
        case 'table':
            let tableStream = table.createStream({
                columnDefault: {
                    width: 50
                },
                columnCount: 1
            });

            // chalk.bold('')
            
            tableStream.write(rows.map(row => columns.map(key => row[key])));

            return table(
                (columns
                    ? (headers ? [columns] : []).concat(
                          rows.map(row => columns.map(key => row[key]))
                      )
                    : rows
                ).map(row =>
                    row.map(val =>
                        val && val.length > maxLength
                            ? `${val.substr(0, maxLength).trim()}…`
                            : val || ''
                    )
                )
            );
        case 'csv':
        case 'tsv':
            return dsv[format + (headers ? 'Format' : 'FormatBody')](
                rows,
                columns
            );
        default:
            throw new Error(
                'Invalid format specified, options are: table, ndjson, csv'
            );

    if (!rows || rows.length === 0) {
        throw new Error('No results returned');
    }

    if (columns) {
        rows = rows.map(row =>
            Object.entries(row)
                .filter(entry => columns.includes(entry[0]))
                .reduce(
                    (obj, [key, val]) => Object.assign(obj, { [key]: val }),
                    {}
                )
        );
    }

    switch (format) {
        case 'json':
            return JSON.stringify({
                rows: rows
            });
        case 'ndjson':
            return rows.map(JSON.stringify).join('\n');
        case 'table':
            return table(
                (columns
                    ? (headers ? [columns] : []).concat(
                          rows.map(row => columns.map(key => row[key]))
                      )
                    : rows
                ).map(row =>
                    row.map(val =>
                        val && val.length > maxLength
                            ? `${val.substr(0, maxLength).trim()}…`
                            : val || ''
                    )
                )
            );
        case 'csv':
        case 'tsv':
            return dsv[format + (headers ? 'Format' : 'FormatBody')](
                rows,
                columns
            );
        default:
            throw new Error(
                'Invalid format specified, options are: table, ndjson, csv'
            );
    }
};
