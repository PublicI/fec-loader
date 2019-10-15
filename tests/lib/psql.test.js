const { ObjectReadableMock, ObjectWritableMock } = require('stream-mock');

const psql = require('../../lib/psql');
const fs = require('fs');

Date.now = jest.fn(() => 1487076708000);

test('psql', async done => {
    const input = fs.createReadStream(__dirname + '/../fixtures/romney-f3p.fec');
    const writer = new ObjectWritableMock();

    psql({
        in: input,
        out: writer
    });

    writer.on('finish', () => {
        expect(writer.data).toMatchSnapshot();
        done();
    });
});
