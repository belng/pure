/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { startThread } from '../../../modules/store/actions';

type Props = {
	user: string;
	room: string;
}

type State = {
	thread: ?string
}

export default class StartDiscussionContainer extends Component<void, Props, State> {
	static propTypes = {
		user: PropTypes.string.isRequired,
		room: PropTypes.string.isRequired,
	};

	state: State = {
		thread: null,
	};

	render() {
		return (
			<Connect
				mapSubscriptionToProps={{
					room: {
						key: {
							type: 'entity',
							id: this.props.room
						}
					},
					thread: {
						key: {
							type: 'entity',
							id: this.state.thread
						}
					}
				}}
				mapActionsToProps={{
					startThread: (store, result) => (name, body, meta) => {
						const changes = startThread({
							name,
							body,
							meta,
							parents: [ result.room.id ].concat(result.room.parents),
							creator: this.props.user
						});

						store.dispatch(changes);

						// FIXME: This should be simpler
						this.setState({
							thread: Object.keys(changes.entities)[0]
						});
					}
				}}
				passProps={this.props}
				component={Dummy}
			/>
		);
	}
}
