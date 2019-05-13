const fetch = require('cross-fetch'),
	Parser = require('rss-parser');

module.exports = async () => {
	let parser = new Parser();

	const feedUrl =
		'http://efilingapps.fec.gov/rss/generate?preDefinedFilingType=ALL';

	try {
		const res = await fetch(feedUrl);

		if (res.status >= 400) {
			throw new Error('Bad response from server');
		}

		const text = await res.text();

		let feed = await parser.parseString(text);

		let filings = feed.items.map(filing => filing.link);

		console.log(filings.join('\n'));
	} catch (err) {
		console.error(err);
	}
};
