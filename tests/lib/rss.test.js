const { ObjectReadableMock, ObjectWritableMock } = require('stream-mock');

jest.mock('cross-fetch');
const fetch = require('cross-fetch');

const originalProcess = process;

global.process = {
    ...originalProcess,
    mainModule: {
        filename: 'rss.test.js'
    }
};

const rss = require('../../lib/rss');

global.process = originalProcess;

test('rss', async done => {
    const input = `<?xml version="1.0" encoding="UTF-8"?>
        <rss xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
          <channel>
            <item>
              <title>New filing by SALTCHUK RESOURCES, INC. PAC</title>
              <link>http://docquery.fec.gov/dcdev/posted/1354911.fec</link>
              <description>&lt;p&gt;The SALTCHUK RESOURCES, INC. PAC successfully filed  their F3XN OCTOBER MONTHLY with the coverage period of 09/01/2019 to 09/30/2019 and a confirmation ID of FEC-1354911&lt;/p&gt;*********CommitteeId: C00411694 | FilingId: 1354911 | FormType: F3XN | CoverageFrom: 09/01/2019 | CoverageThrough: 09/30/2019 | ReportType: OCTOBER MONTHLY*********</description>
              <pubDate>Sat, 05 Oct 2019 19:03:06 GMT</pubDate>
              <guid>http://docquery.fec.gov/dcdev/posted/1354911.fec</guid>
              <dc:date>2019-10-05T19:03:06Z</dc:date>
            </item>
          </channel>
        </rss>`;

    const reader = new ObjectReadableMock(input);
    const writer = new ObjectWritableMock();

    fetch.mockReturnValue(
        Promise.resolve({
            body: reader
        })
    );

    const stream = await rss({});

    stream.pipe(writer);

    writer.on('finish', () => {
        expect(fetch.mock.calls).toMatchSnapshot();
        expect(writer.data).toMatchSnapshot();
        done();
    });
    
});
