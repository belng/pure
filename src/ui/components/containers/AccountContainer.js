/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Account from '../views/Account/Account';
import { saveUser, signOut } from '../../../modules/store/actions';

const mapActionsToProps = {
	saveUser: store => user => store.dispatch(saveUser(user)),
	saveParams: (store, result) => params => store.dispatch(saveUser({ ...result.user, params })),
	signOut: store => () => store.dispatch(signOut()),
};

const AccountContainer = (props: { user: string }) => (
	<Connect
		mapSubscriptionToProps={{
			user: {
				key: {
					type: 'entity',
					id: props.user,
				}
			}
		}}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={Account}
	/>
);

AccountContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default AccountContainer;
