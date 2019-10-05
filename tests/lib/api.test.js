const { ObjectReadableMock, ObjectWritableMock } = require('stream-mock');

jest.mock('cross-fetch');
const fetch = require('cross-fetch');

const api = require('../../lib/api');

test('api', async done => {
    const input = JSON.stringify({
        results: [
            {
                fec_file_id: 'FEC-24'
            }
        ]
    });

    const reader = new ObjectReadableMock(input);
    const writer = new ObjectWritableMock();

    fetch.mockReturnValue(
        Promise.resolve({
            body: reader
        })
    );

    const stream = await api({
        key: 'example'
    });

    stream.pipe(writer);

    writer.on('finish', () => {
        expect(fetch.mock.calls).toMatchSnapshot();
        expect(writer.data).toMatchSnapshot();
        done();
    });
    
});
