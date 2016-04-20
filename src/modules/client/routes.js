/* @flow */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Home from '../../ui/components/views/Home.web';
import ServerHTML from './ServerHTML';
import promisify from '../../lib/promisify';
import { convertURLToRoute } from '../../lib/Route';
import { bus, cache, config } from '../../core-server';

const getEntityAsync = promisify(cache.getEntity.bind(cache));

bus.on('http/init', app => {
	app.use(function *(next) {
		if (this.method === 'GET') {
			const route = convertURLToRoute(this.request.href);

			let title;

			if (route.props) {
				switch (route.name) {
				case 'room':
					const room = yield getEntityAsync(route.props.room);

					if (room) {
						title = room.name;
					} else {
						title = 'This group doesn\'t exist on Belong';
					}
					break;
				case 'chat':
					const thread = yield getEntityAsync(route.props.thread);

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
						description='Connect with your neighbors on Belong!'
						body={ReactDOMServer.renderToString(
							<Home
								url={`https://play.google.com/store/apps/details?id=${config.package_name}`}
								radiumConfig={{ userAgent: this.headers['user-agent'] }}
							/>
						)}
						image={`${this.request.origin}/assets/thumbnail.png`}
						permalink={this.request.href}
					/>
				);
			}
		}

		return yield next;
	});
});
