/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import PageLoading from './PageLoading';
import ChatMessagesContainer from '../containers/ChatMessagesContainer';
import ChatInput from './ChatInput';
import BannerOfflineContainer from '../containers/BannerOfflineContainer';

const {
	View,
	StyleSheet
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});

export default class Chat extends Component {
	static propTypes = {
		room: PropTypes.string.isRequired,
		thread: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
		sendMessage: PropTypes.func.isRequired
	};

	_input: Object;

	_quoteMessage: Function = (text: string) => {
		this._input.setQuotedText(text);
	};

	_replyToMessage: Function = (user: string) => {
		this._input.setReplyTo(user);
	};

	render() {
		if (this.props.user === 'missing') {
			return <PageLoading />;
		}

		return (
			<View {...this.props}>
				<BannerOfflineContainer />

				<ChatMessagesContainer
					style={styles.container}
					room={this.props.room}
					thread={this.props.thread}
					user={this.props.user}
					quoteMessage={this._quoteMessage}
					replyToMessage={this._replyToMessage}
				/>

				<ChatInput
					ref={c => (this._input = c)}
					room={this.props.room}
					thread={this.props.thread}
					user={this.props.user}
					sendMessage={this.props.sendMessage}
				/>
			</View>
		);
	}
}
