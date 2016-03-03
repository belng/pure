/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import Account from '../views/Account/Account';
import { saveUser, signOut } from '../../../modules/store/actions';

const mapActionsToProps = {
	saveUser: store => user => store.dispatch(saveUser(user)),
	saveParams: (store, result) => params => store.dispatch(saveUser({ ...result.user, params })),
	signOut: store => () => store.dispatch(signOut()),
};

const AccountContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			user: {
				key: 'me'
			}
		}}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={Account}
	/>
);

export default AccountContainer;
