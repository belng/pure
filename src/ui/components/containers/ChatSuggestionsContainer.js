/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const ChatSuggestionsContainerInner = Connect(({ prefix, user }) => ({
	users: {
		key: {
			slice: {
				type: 'user',
				filter: {
					prefix
				},
				order: 'id'
			},
			// REVIEW: verify the range schema works
			range: {
				start: -Infinity,
				before: 5,
				after: 0,
			}
		},
		transform: results => results.filter(item => item.id !== user)
	}
}))(Dummy);

ChatSuggestionsContainerInner.propTypes = {
	prefix: PropTypes.string.isRequired,
	user: PropTypes.string.isRequired
};

export default class ChatSuggestionsContainer extends Component<void, any, { prefix: string }> {
	state: { prefix: string } = {
		prefix: '',
	};

	_getMatchingUsers: Function = (prefix: string) => {
		this.setState({
			prefix: prefix.trim()
		});
	};

	render() {
		return (
			<ChatSuggestionsContainerInner
				{...this.props}
				{...this.state}
				getMatchingUsers={this._getMatchingUsers}
			/>
		);
	}
}
