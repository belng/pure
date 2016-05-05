/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import Connect from '../../../modules/store/Connect';
import ChatSuggestions from '../views/ChatSuggestions';

type Props = {
	user: string;
	prefix: string;
}

export default class ChatSuggestionsContainer extends Component<void, Props, { prefix: string }> {
	static propTypes = {
		user: PropTypes.string,
	};

	state: { prefix: string } = {
		prefix: '',
	};

	componentWillReceiveProps(nextProps: Props) {
		if (typeof nextProps.prefix === 'string') {
			this.setState({
				prefix: nextProps.prefix.trim(),
			});
		}
	}

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const {
			prefix,
			user,
		} = this.state;

		if (!prefix) {
			return null;
		}

		return (
			<Connect
				mapSubscriptionToProps={{
					data: {
						key: {
							slice: {
								type: 'user',
								filter: {
									id_mts: this.state.prefix,
								},
								order: 'updateTime',
							},
							range: {
								start: -Infinity,
								before: 0,
								after: 5,
							},
						},
						transform: results => results.filter(item => item.type !== 'loading' && item.id !== user),
					},
				}}
				passProps={this.props}
				component={ChatSuggestions}
			/>
		);
	}
}
