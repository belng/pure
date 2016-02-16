/* @flow */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ServerHTML from '../../ui/ServerHTML';
import Home from '../../ui/components/views/Home.web';

export function *home(): Generator {
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
