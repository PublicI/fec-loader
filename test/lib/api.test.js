const { ObjectWritableMock } = require('stream-mock');

jest.mock('isomorphic-unfetch');
const fetch = require('isomorphic-unfetch');

const api = require('../../lib/api');

test('api', async done => {
    fetch.mockReturnValue(
        Promise.resolve({
            json: () =>
                Promise.resolve({
                    results: [
                        {
                            fec_file_id: 'FEC-24'
                        }
                    ]
                })
        })
    );

    const writer = new ObjectWritableMock();

    const stream = await api({
        key: 'example'
    });

    stream.pipe(writer);

    writer.on('finish', () => {
        expect(writer.data).toMatchSnapshot();
        done();
    });
    
});
