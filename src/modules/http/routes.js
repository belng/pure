import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ServerHTML from '../../ui/ServerHTML';
import Hello from '../../ui/components/views/Hello';

export function *home() {
	this.body = '<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(
		<ServerHTML
			locale="en"
			title="React Bolierplate"
			description="Simple boilerplate for React"
			body={ReactDOMServer.renderToString(<Hello radiumConfig={{ userAgent: this.headers['user-agent'] }} />)}
		/>
	);
}

export function *room(roomId) {
	this.body = '<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(
		<ServerHTML
			locale="en"
			title={roomId}
			description="Simple boilerplate for React"
			body={ReactDOMServer.renderToString(<Hello radiumConfig={{ userAgent: this.headers['user-agent'] }} />)}
		/>
	);
}

export function *thread(roomId, threadId) {
	this.body = '<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(
		<ServerHTML
			locale="en"
			title={threadId + ' - ' + roomId}
			description="Simple boilerplate for React"
			body={ReactDOMServer.renderToString(<Hello radiumConfig={{ userAgent: this.headers['user-agent'] }} />)}
		/>
	);
}
