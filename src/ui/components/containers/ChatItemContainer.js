/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import {
	hideText,
	unhideText,
	banUser,
	unbanUser
} from '../../../modules/store/actions';

const mapActionsToProps = {
	hideText: (store, result) => () => store.dispatch(hideText(result.text.id)),
	unhideText: (store, result) => () => store.dispatch(unhideText(result.text.id)),
	banUser: (store, result) => () => store.dispatch(banUser(result.text.creator)),
	unbanUser: (store, result) => () => store.dispatch(unbanUser(result.text.creator)),
};

const ChatItemContainer = (props: any) => (
	<Connect mapActionsToProps={mapActionsToProps}>
		<Dummy {...props} />
	</Connect>
);

ChatItemContainer.propTypes = {
	text: PropTypes.shape({
		id: PropTypes.string,
		creator: PropTypes.string,
	})
};

export default ChatItemContainer;
