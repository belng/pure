/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { dismissAllNotes } from '../../../modules/store/actions';

const NotificationClearIconContainer = Connect(null, {
	dismissAllNotes: (props, store) => () => store.setState(dismissAllNotes())
})(Dummy);

export default NotificationClearIconContainer;
