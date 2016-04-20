/* @flow */

import route from 'koa-route';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Home from '../../ui/components/views/Home.web';
import ServerHTML from './ServerHTML';
import promisify from '../../lib/promisify';
import { convertURLToRoute } from '../../lib/Route';
import { bus, cache, config } from '../../core-server';

const PLAY_STORE_LINK = `https://play.google.com/store/apps/details?id=${config.package_name}`;

const getEntityAsync = promisify(cache.getEntity.bind(cache));

bus.on('http/init', app => {
	app.use(route.get('*', function *() {
		const query = this.request.query;

		if (query && query.download_app) {
			this.response.redirect(query.referrer ? `${PLAY_STORE_LINK}&referrer=${query.referrer}` : PLAY_STORE_LINK);
			return;
		}

		const { name, props } = convertURLToRoute(this.request.href);

		let title;

		if (props) {
			switch (name) {
			case 'room':
				const room = yield getEntityAsync(props.room);

				if (room) {
					title = room.name;
				} else {
					title = 'This group doesn\'t exist on Belong';
				}
				break;
			case 'chat':
				const thread = yield getEntityAsync(props.thread);

				if (thread) {
					title = thread.name;
				} else {
					title = 'This discussion doesn\'t exist on Belong';
				}

				break;
			}
		}

		if (title) {
			this.body = '<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(
				<ServerHTML
					locale='en'
					title={title}
					description={`Connect with your neighbors on ${config.app_name}!`}
					body={ReactDOMServer.renderToString(
						<Home
							url={PLAY_STORE_LINK}
							radiumConfig={{ userAgent: this.headers['user-agent'] }}
						/>
					)}
					image={`${this.request.origin}/assets/thumbnail.png`}
					permalink={this.request.href}
				/>
			);
		}
	}));
});
