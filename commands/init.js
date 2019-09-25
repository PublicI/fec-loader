const { init } = require('../');

module.exports = {
    command: 'init',
    describe: 'Create a SQL schema in a database; uses PGHOST, PGDATABASE, PGUSER, PGPASSWORD environment variables to authenticate.',
    builder: {},
    handler: init
};
