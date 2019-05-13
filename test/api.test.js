const { api } = require('../');

test('api', () => {
	expect(api()).resolves.not.toBe('octopus');
});
