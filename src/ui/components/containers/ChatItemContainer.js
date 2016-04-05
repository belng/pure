/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import ChatItem from '../views/ChatItem';
import {
	hideText,
	unhideText,
	hideThread,
	unhideThread,
	banUser,
	unbanUser
} from '../../../modules/store/actions';
import { TAG_USER_ADMIN, TYPE_THREAD } from '../../../lib/Constants';

const hasAdminTag = user => (user && user.tags && user.tags.indexOf(TAG_USER_ADMIN) > -1);

const mapSubscriptionToProps = {
	isUserAdmin: {
		key: 'me',
		transform: hasAdminTag
	}
};

const mapActionsToProps = {
	hideText: (store, result, props) => () => {
		if (props.text.type === TYPE_THREAD) {
			store.dispatch(hideThread(props.text.id));
		} else {
			store.dispatch(hideText(props.text.id));
		}
	},
	unhideText: (store, result, props) => () => {
		if (props.text.type === TYPE_THREAD) {
			store.dispatch(unhideThread(props.text.id));
		} else {
			store.dispatch(unhideText(props.text.id));
		}
	},
	banUser: (store, result, props) => () => store.dispatch(banUser(props.text.creator)),
	unbanUser: (store, result, props) => () => store.dispatch(unbanUser(props.text.creator)),
};

const ChatItemContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={ChatItem}
	/>
);

ChatItemContainer.propTypes = {
	text: PropTypes.shape({
		id: PropTypes.string,
		creator: PropTypes.string,
	})
};

export default ChatItemContainer;
