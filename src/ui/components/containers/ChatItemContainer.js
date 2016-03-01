/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import {
	hideText,
	unhideText,
	banUser,
	unbanUser
} from '../../../modules/store/actions';

const ChatItemContainer = Connect(null, {
	hideText: (props, store) => () => store.dispatch(hideText(props.text.id)),
	unhideText: (props, store) => () => store.dispatch(unhideText(props.text.id)),
	banUser: (props, store) => () => store.dispatch(banUser(props.text.creator)),
	unbanUser: (props, store) => () => store.dispatch(unbanUser(props.text.creator)),
})(Dummy);

ChatItemContainer.propTypes = {
	text: PropTypes.shape({
		id: PropTypes.string,
		creator: PropTypes.string,
	})
};

export default ChatItemContainer;
