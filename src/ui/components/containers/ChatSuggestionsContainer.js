/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

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
			>
				<Dummy getMatchingUsers={this._getMatchingUsers} />
			</Connect>
		);
	}
}

ChatSuggestionsContainer.propTypes = {
	user: PropTypes.string.isRequired
};
