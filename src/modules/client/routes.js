/* @flow */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Home from '../../ui/components/views/Home.web';
import ServerHTML from './ServerHTML';
import { convertURLToRoute } from '../../lib/Route';

export default function(): Function {
	return function *(next) {
		if (this.method === 'GET') {
			const route = convertURLToRoute(this.request.href);

			switch (route.name) {
			case 'home':
				this.body = '<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(
					<ServerHTML
						locale='en'
						title='React Bolierplate'
						description='Simple boilerplate for React'
						body={ReactDOMServer.renderToString(<Home radiumConfig={{ userAgent: this.headers['user-agent'] }} />)}
						image={`${this.request.origin}/assets/thumbnail.png`}
						permalink={this.request.href}
					/>
				);
			}
		}

		return yield next;
	};
}
