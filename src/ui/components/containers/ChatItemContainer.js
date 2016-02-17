/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const ChatItemContainer = Connect(null, {
	copyToClipboard: () => () => {},
	showMenu: () => () => {},
})(Dummy);

export default ChatItemContainer;
