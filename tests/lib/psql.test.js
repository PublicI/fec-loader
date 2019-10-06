const { ObjectReadableMock, ObjectWritableMock } = require('stream-mock');
const { advanceTo } = require('jest-date-mock');

const psql = require('../../lib/psql');
const fs = require('fs');

test('psql', async done => {
    const input = fs.createReadStream(__dirname + '/../fixtures/989514.fec');
    const writer = new ObjectWritableMock();

    advanceTo(new Date(2019, 10, 5, 0, 0, 0));

    psql({
        in: input,
        out: writer
    });

    writer.on('finish', () => {
        expect(writer.data).toMatchSnapshot();
        done();
    });
});
