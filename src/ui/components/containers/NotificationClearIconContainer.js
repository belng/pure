/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { dismissAllNotes } from '../../../modules/store/actions';

const mapActionsToProps = {
	dismissAllNotes: store => () => store.dispatch(dismissAllNotes())
};

const NotificationClearIconContainer = (props: any) => (
	<Connect mapActionsToProps={mapActionsToProps}>
		<Dummy {...props} />
	</Connect>
);

export default NotificationClearIconContainer;
