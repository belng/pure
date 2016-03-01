/* eslint-env jest */
/* eslint-disable import/no-commonjs */

jest.dontMock('../regexes')
	.dontMock('assert');

const regexes = require('../regexes').default;
const assert = require('assert');

describe('oembed: regexes', () => {
	const link = regexes.link;
	const meta = regexes.propertyRegex('type');
	const cont = regexes.content;

	it('testing link regex : ', () => {
		const test1 = '<link>'.match(link);
		const test2 = "<link type='application/json+oembed'".match(link);
		const test3 = "<link something type='application/json+oembed'>".match(link);
		const test4 = "<link something type='application/json+oembed' something>".match(link);

		assert(test1 === null, 'the value should be null');
		assert(test2 === null, 'the value should be null');
		assert(test3 !== null, 'the value should not be null');
		assert(test4 !== null, 'the value should not be null');
	});

	it('testing link and href regex : ', () => {
		const href = regexes.matchHTTP;
		const test1 = "<link href='http://manoj' type='application/json+oembed'>".match(link)[0].match(href);
		const test2 = "<link type='application/json+oembed' href='https://manoj' >".match(link)[0].match(href);
		const test3 = "<link something type='application/json+oembed'>".match(link)[0].match(href);

		assert(test1 !== null, 'the value should not be null test1');
		assert(test2 !== null, 'the value should not be null test2');
		assert(test3 === null, 'the value should be null');
	});

	it('testing meta regex : ', () => {
		const test1 = '<meta>'.match(meta);
		const test2 = "<meta property='og:time'>".match(meta);
		const test3 = "<meta manoj property='og:type' content='some'>".match(meta);

		assert(test1 === null, 'the value of the test1 should be null');
		assert(test2 === null, 'the value of the test2 should be null');
		assert(test3 !== null, 'the value of the test3 should not be null');
	});

	it('testing meta with content regex : ', () => {
		const test1 = "<meta manoj property='og:type' content='some'>".match(meta)[0].match(cont);
		const test2 = "<meta content='some'manoj property='og:type'>".match(meta)[0].match(cont);

		assert(test1 !== null, 'the value of test1 should not be null');
		assert(test2 !== null, 'the value of test2 should not be null');
	});
});
