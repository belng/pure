/* eslint-env jest */
/* eslint-disable import/no-commonjs */

jest.dontMock('babel-polyfill')
	.dontMock('node-fetch')
	.dontMock('xmlhttprequest')
	.dontMock('../oEmbed')
	.dontMock('../oEmbedStorage')
	.dontMock('../getContentType')
	.dontMock('../providers')
	.dontMock('../regexes')
	.setMock('react-native', require('../__mocks__/ReactNative'));

require('babel-polyfill');

const oEmbed = require('../oEmbed').default;

global.fetch = require('node-fetch');
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

describe('oEmbed', function() {
	this.env.defaultTimeoutInterval = 300000;

	pit('should return oEmbed data', () => {
		return oEmbed('https://www.youtube.com/watch?v=uVdV-lxRPFo')
		.then(data => {
			expect(data.type).toBe('video');
			expect(data.title).toBe('Captain America: Civil War - Trailer World Premiere');
			expect(data.thumbnail_url).toBe('https://i.ytimg.com/vi/uVdV-lxRPFo/hqdefault.jpg');
			expect(data.thumbnail_height).toBe(360);
			expect(data.thumbnail_width).toBe(480);
		});
	});

	pit('should return opengraph data', () => {
		return oEmbed('http://on.aol.com/video/officials-fox-lake-officer-s-death-a-suicide-519216799?context=PC:homepage:PL1944:1446706878971')
		.then(data => {
			expect(data.type).toBe('link');
			expect(data.title).toBe('Officials: Fox Lake Officer\'s Death a Suicide');
			expect(data.thumbnail_url).toBe('http://feedapi.b2c.on.aol.com/v1.0/app/videos/aolon/519216799/images/470x264.jpg?region=US');
			expect(data.thumbnail_height).toBe(264);
			expect(data.thumbnail_width).toBe(470);
		});
	});

	pit('should return meta data', () => {
		return oEmbed('http://www.w3schools.com/')
		.then(data => {
			expect(data.type).toBe('link');
			expect(data.title).toBe('W3Schools Online Web Tutorials');
		});
	});

	pit('should return image data', () => {
		return oEmbed('http://1.images.comedycentral.com/images/shows/GetSpooked/getspooked_thumbnail.jpg?width=640&height=360&crop=true')
		.then(data => {
			expect(data.type).toBe('link');
			expect(data.thumbnail_url).toBe('http://1.images.comedycentral.com/images/shows/GetSpooked/getspooked_thumbnail.jpg?width=640&height=360&crop=true');
		});
	});

	pit('should return correct data', () => {
		return oEmbed('http://www.deccanherald.com/content/514998/bjp-mps-asked-avoid-making.html')
		.then(data => {
			expect(data.type).toBe('link');
			expect(data.thumbnail_url).toBe('http://www.deccanherald.com/page_images/original/2015/12/01/514998.jpg');
			expect(data.title).toBe('BJP MPs asked to avoid making provocative statements');
			expect(data.description).toBe('BJP MPs were today asked to avoid making provocative statements amid the debate in Parliament over the issue of intolerance where controversial comments by some party leaders, including ministers, have come in handy for the opposition in its attack on the government.');
		});
	});

	pit('should return correct data', () => {
		return oEmbed('http://www.storypick.com/mark-priscilla-max/')
		.then(data => {
			expect(data.type).toBe('rich');
			expect(data.thumbnail_url).toBe('http://www.storypick.com/wp-content/uploads/2015/12/mark-priscilla-cover.jpg');
			expect(data.title).toBe('Mark Zuckerberg Just Became Dad Of A Baby Girl, Pledges To Donate 99% Of Facebook Shares.');
		});
	});

	pit('should return correct data', () => {
		return oEmbed('http://9gag.com/gag/aNK6m3b')
		.then(data => {
			expect(data.type).toBe('link');
			expect(data.thumbnail_url).toBe('http://images-cdn.9gag.com/photo/aNK6m3b_700b.jpg');
			expect(data.title).toBe('I am a film student. This was a question on my sound recording test.');
			expect(data.description).toBe('Click to see the pic and write a comment...');
		});
	});

	pit('should return correct data', () => {
		return oEmbed('https://twitter.com/HackerEarth/status/671949412956901376')
		.then(data => {
			expect(data.type).toBe('rich');
		});
	});

	pit('should return correct data', () => {
		return oEmbed('http://timesofindia.indiatimes.com/city/chennai/Chennai-Floods-City-reels-even-as-more-rain-predicted-airport-closed-trains-canceled/articleshow/50008799.cms')
		.then(data => {
			expect(data.type).toBe('link');
			expect(data.thumbnail_url).toBe('http://timesofindia.indiatimes.com/photo/50009399.cms');
			expect(data.title).toBe('Chennai Floods: City reels even as more rain predicted; airport closed, trains canceled - Times of India');
			expect(data.description).toBe('Chennai is at a standstill because of floods caused by the worst rains in a 100 years. The airport has been closed and trains canceled. But things could get worse, with the Met Department predicting more rain for northern Tamil Nadu in coming days.');
		});
	});

	pit('should return correct data', () => {
		return oEmbed('http://www.collegehumor.com/post/7034949/what-the-world-looks-like-when-youre-hungry?ref=homepage')
		.then(data => {
			expect(data.type).toBe('link');
			expect(data.thumbnail_url).toBe('http://2.media.collegehumor.cvcdn.com/31/46/dfaed81e7bce3deebb492bc6a070e5bd.jpg');
			expect(data.title).toBe('7 Ways The World Changes When You\'re Hungry');
			expect(data.description).toBe('Everything looks a lot more delicious when you\'re hungry.');
		});
	});

	pit('should return correct data', () => {
		return oEmbed('http://www.scoopwhoop.com/news/spirit-of-chennai-come-rain-or-floods-this-woman-will-continue-to-do-her-job/')
		.then(data => {
			expect(data.type).toBe('link');
			expect(data.thumbnail_url).toBe('http://s3.scoopwhoop.com/anj/636386272.jpg');
			expect(data.title).toBe('Radha Has Been Delivering Milk For 25 Years & Even The Chennai Floods Couldn’t Stop Her');
			expect(data.description).toBe('Against all odds');
		});
	});
});
