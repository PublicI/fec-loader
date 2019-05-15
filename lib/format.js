const table = require('text-table'),
    dsv = require('d3-dsv');

module.exports = (rows, format, columns, headers = true, maxLength = 30) => {
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
