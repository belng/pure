/* @flow */

import { config } from '../../core-client';

const { protocol, host } = config.server;

export default async function shortenURL(url: string) {
	const response = await fetch(protocol + '//' + host + '/x/shorten-url?longurl=' + encodeURIComponent(url));
	const path = await response.text();

	return protocol + '//' + host + '/' + path;
}
