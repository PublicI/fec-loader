var api = require('./lib/api'),
    check = require('./lib/check'),
    dir = require('./lib/dir'),
    increment = require('./lib/increment'),
    models = require('./lib/models'),
    queue = require('./lib/import'),
    rss = require('./lib/rss'),
    unzip = require('./lib/unzip');

module.exports = {
    api,
    check,
    dir,
    increment,
    queue,
    rss,
    sync: models.sync,
    unzip
};

if (require.main === module) {
    models.sync(() => {
        // no-op
    });
}
