/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { startThread } from '../../../modules/store/actions';

const StartDiscussionContainerInner = Connect(({ room, thread }) => ({
	room: {
		key: {
			type: 'entity',
			id: room
		}
	},
	thread: {
		key: {
			type: 'entity',
			id: thread
		}
	}
}), {
	startThread: (props, store) => (name, body, meta) => {
		const changes = startThread({
			name,
			body,
			meta,
			parents: [ props.room.id ].concat(props.room.parents),
			creator: props.user
		});

		store.setState(changes);

		// FIXME: This should be simpler
		props.setCurrentThread(Object.keys(changes.entities)[0]);
	}
})(Dummy);

StartDiscussionContainerInner.propTypes = {
	room: PropTypes.string.isRequired,
	user: PropTypes.string.isRequired,
};

export default class StartDiscussionContainer extends Component<void, any, { thread: ?string }> {
	state: { thread: ?string } = {
		thread: null
	};

	_setCurrentThread = (id: string) => {
		this.setState({
			thread: id
		});
	};

	render() {
		const props = { ...this.props, ...this.state };

		return (
			<StartDiscussionContainerInner {...props} setCurrentThread={this._setCurrentThread} />
		);
	}
}
