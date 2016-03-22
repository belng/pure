/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import ChatSuggestions from '../views/ChatSuggestions';

type Props = {
	user: string
}

export default class ChatSuggestionsContainer extends Component<void, Props, { prefix: string }> {
	static propTypes = {
		user: PropTypes.string
	};

	state: { prefix: string } = {
		prefix: '',
	};

	_getMatchingUsers: Function = (prefix: string) => {
		this.setState({
			prefix: prefix.trim()
		});
	};

	render() {
		if (!this.state.prefix) {
			return null;
		}

		return (
			<Connect
				mapSubscriptionToProps={{
					users: {
						key: {
							slice: {
								type: 'user',
								filter: {
									prefix: this.state.prefix
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
						transform: results => results.filter(item => item.id !== this.props.user)
					}
				}}
				passProps={{ ...this.props, getMatchingUsers: prefix => this._getMatchingUsers(prefix) }}
				component={ChatSuggestions}
			/>
		);
	}
}
