/* @flow */

export default [
	[ /https?:\/\/(www\.)?(m\.)?youtube\.com\/watch/i, 'http://www.youtube.com/oembed' ],
	[ /https?:\/\/(www\.)?youtu\.be\/\S+/, 'http://www.youtube.com/oembed' ],
	[ /https?:\/\/(www\.)?vimeo\.com\/\S+/i, 'http://vimeo.com/api/oembed.json' ],
	[ /https?:\/\/(www\.)?dailymotion\.com\/\S+/i, 'http://www.dailymotion.com/services/oembed' ],
	[ /https?:\/\/(www\.)?flickr\.com\/photos\/\S+/i, 'http://www.flickr.com/services/oembed' ],
	[ /https?:\/\/(www\.)?flic\.kr\/p\/\S+/i, 'http://www.flickr.com/services/oembed' ],
	[ /https?:\/\/(www\.)?hulu\.com\/watch\/\S+/i, 'http://www.hulu.com/api/oembed.json' ],
	[ /https?:\/\/(www\.)?funnyordie\.com\/videos\S+/i, 'http://www.funnyordie.com/oembed' ],
	[ /https?:\/\/(www\.)?soundcloud\.com\S+/i, 'http://soundcloud.com/oembed' ],
	[ /https?:\/\/(www\.)?instagr(\.am|am\.com)\/p\/\S+/i, 'http://api.instagram.com/oembed' ],
	[ /https?:\/\/(www\.)?ifttt\.com\/recipes\/\S+/i, 'http://www.ifttt.com/oembed/' ],
	[ /https?:\/\/(www\.)?ifttt\.com\/recipes\/\S+/i, 'http://www.ifttt.com/oembed/' ],
	[ /https?:\/\/(www\.)?viddler\.com\/v\/\S+/i, 'http://www.viddler.com/oembed/' ],
	[ /https?:\/\/(www\.)?portfolium\.com\/entry\/\S+/i, 'https://api.portfolium.com/oembed' ],
	[ /https?:\/\/(www\.)?ifixit\.com\/Guide\/View\/\S+/i, 'http://www.ifixit.com/Embed' ],
	[ /https?:\/\/.*smugmug\.com\/\S+/i, 'http://api.smugmug.com/services/oembed/' ],
	[ /https?:\/\/.*deviantart\.com\/art\/\S+/i, 'http://backend.deviantart.com/oembed' ],
	[ /https?:\/\/.*deviantart\.com\/.*#\/d\S+/i, 'http://backend.deviantart.com/oembed' ],
	[ /https?:\/\/fav\.me\/\S+/i, 'http://backend.deviantart.com/oembed' ],
	[ /https?:\/\/stash\.sh\/\S+/i, 'http://backend.deviantart.com/oembed' ],
];
