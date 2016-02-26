/* eslint-env jest */
/* eslint-disable import/no-commonjs */

jest.autoMockOff()
	.setMock('react-native', require('../__fixtures__/ReactNative'));

require('babel-polyfill');

const oembed = require('../oembed').default;
const assert = require('assert');

global.fetch = require('node-fetch');
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

describe('oembed', function() {
	this.env.defaultTimeoutInterval = 60000;

	pit('should return oembed data', () => {
		return oembed('https://www.youtube.com/watch?v=uVdV-lxRPFo')
		.then(data => {
			assert.equal(data.type, 'video');
			assert.equal(data.title, 'Captain America: Civil War - Trailer World Premiere');
			assert.equal(data.thumbnail_url, 'https://i.ytimg.com/vi/uVdV-lxRPFo/hqdefault.jpg');
			assert.equal(data.thumbnail_height, 360);
			assert.equal(data.thumbnail_width, 480);
		});
	});

	pit('should return opengraph data', () => {
		return oembed('http://on.aol.com/video/officials-fox-lake-officer-s-death-a-suicide-519216799?context=PC:homepage:PL1944:1446706878971')
		.then(data => {
			assert.equal(data.type, 'video');
			assert.equal(data.title, 'Officials: Fox Lake Officer&#x27;s Death a Suicide');
			assert.equal(data.thumbnail_url, 'http://feedapi.b2c.on.aol.com/v1.0/app/videos/aolon/519216799/images/470x264.jpg?region=US');
			assert.equal(data.thumbnail_height, 264);
			assert.equal(data.thumbnail_width, 470);
		});
	});

	pit('should return meta data', () => {
		return oembed('http://www.w3schools.com/')
		.then(data => {
			assert.equal(data.title, 'W3Schools Online Web Tutorials');
		});
	});

	pit('should return image data', () => {
		return oembed('http://1.images.comedycentral.com/images/shows/GetSpooked/getspooked_thumbnail.jpg?width=640&height=360&crop=true')
		.then(data => {
			assert.equal(data.type, 'image');
			assert.equal(data.thumbnail_url, 'http://1.images.comedycentral.com/images/shows/GetSpooked/getspooked_thumbnail.jpg?width=640&height=360&crop=true');
		});
	});
});
