/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import DiscussionItem from '../views/DiscussionItem';
import {
	hideThread,
	unhideThread,
	banUser,
	unbanUser
} from '../../../modules/store/actions';
import { TAG_USER_ADMIN } from '../../../lib/Constants';

const hasAdminTag = user => (user && user.tags && user.tags.indexOf(TAG_USER_ADMIN) > -1);

const mapSubscriptionToProps = {
	isUserAdmin: {
		key: 'me',
		transform: hasAdminTag
	}
};

const mapActionsToProps = {
	hideThread: (store, result, props) => () => store.dispatch(hideThread(props.thread)),
	unhideThread: (store, result, props) => () => store.dispatch(unhideThread(props.thread)),
	banUser: (store, result, props) => () => store.dispatch(banUser(props.thread.creator)),
	unbanUser: (store, result, props) => () => store.dispatch(unbanUser(props.thread.creator)),
};

const DiscussionItemContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={DiscussionItem}
	/>
);

DiscussionItemContainer.propTypes = {
	thread: PropTypes.shape({
		id: PropTypes.string,
		creator: PropTypes.string,
	})
};

export default DiscussionItemContainer;
