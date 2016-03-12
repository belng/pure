/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import StartDiscussion from '../views/StartDiscussion';
import { startThread } from '../../../modules/store/actions';

type Props = {
	user: string;
	room: string;
}

type State = {
	thread: ?string
}

class StartDiscussionContainer extends Component<void, Props, State> {
	static propTypes = {
		user: PropTypes.string.isRequired,
		room: PropTypes.string.isRequired,
	};

	state: State = {
		thread: null,
	};

	render() {
		const parents = {
			key: {
				type: 'entity',
				id: this.props.room
			},
			transform: room => room && room.parents ? room.parents : []
		};

		let thread;

		if (this.state.thread) {
			thread = {
				key: {
					type: 'entity',
					id: this.state.thread
				}
			};
		}

		return (
			<Connect
				mapSubscriptionToProps={thread ? { parents, thread } : { parents }}
				mapActionsToProps={{
					startThread: (store, result, props) => (name, body, meta) => {
						const changes = startThread({
							name,
							body,
							meta,
							parents: [ props.room ].concat(result.parents),
							creator: props.user
						});

						store.dispatch(changes);

						// FIXME: This should be simpler
						this.setState({
							thread: Object.keys(changes.entities)[0]
						});
					}
				}}
				passProps={this.props}
				component={StartDiscussion}
			/>
		);
	}
}

export default PassUserProp(StartDiscussionContainer);
