/* @flow */

import { convertRouteToURL } from '../../lib/Route';
import { config } from '../../core-client';
import type { Route } from '../../lib/RouteTypes';

type Action = {
	type: 'SHARE_FACEBOOK' | 'SHARE_TWITTER';
	payload: {
		title: string;
		route?: Route;
		text?: string;
		image?: string;
		url?: string;
		hashtags?: Array<string>;
	}
}

export default function(action: Action) {
	switch (action.type) {
	case 'SHARE_FACEBOOK': {
		const { url, route } = action.payload;

		let contentUrl;

		if (route) {
			contentUrl = config.server.protocol + '//' + config.server.host + convertRouteToURL(route);
		} else if (url) {
			contentUrl = url;
		} else {
			contentUrl = config.server.protocol + '//' + config.server.host;
		}

		window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(contentUrl)}`);
		break;
	}
	case 'SHARE_TWITTER': {
		const { text, url, route, hashtags } = action.payload;

		let link = 'http://twitter.com/intent/tweet?';

		if (text) {
			link += `text=${encodeURIComponent(text)}&`;
		}

		if (url) {
			link += `url=${encodeURIComponent(url)}&`;
		} else if (route) {
			link += `url=${encodeURIComponent(config.server.protocol + '//' + config.server.host + convertRouteToURL(route))}&`;
		}

		if (hashtags) {
			link += `url=${encodeURIComponent(hashtags.join(','))}&`;
		}

		link += 'via=belongchat';

		window.open(link);
		break;
	}
	case 'SHARE_WHATSAPP': {
		const { text, url, route } = action.payload;

		const parts = [];

		if (text) {
			parts.push(text);
		}

		if (url) {
			parts.push(url);
		} else if (route) {
			parts.push(config.server.protocol + '//' + config.server.host + convertRouteToURL(route));
		}

		const shareText = parts.join('\n');

		window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`);
		break;
	}
	}
}
