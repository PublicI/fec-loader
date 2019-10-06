const { ObjectReadableMock, ObjectWritableMock } = require('stream-mock');

const ndjson = require('../../lib/ndjson');
const fs = require('fs');

test('ndjson', async done => {
    const input = fs.createReadStream(__dirname + '/../fixtures/989514.fec');
    const writer = new ObjectWritableMock();

    ndjson({
        in: input,
        out: writer
    });

    writer.on('finish', () => {
        expect(writer.data).toMatchSnapshot();
        done();
    });
});
