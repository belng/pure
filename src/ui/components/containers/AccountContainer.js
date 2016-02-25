/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Account from '../views/Account/Account';
import { saveUser, signOut } from '../../../modules/store/actions';

const mapSubscriptionsToProps = ({ user }) => ({
	user: {
		key: {
			slice: {
				type: 'entity',
				filter: {
					id: user
				}
			}
		}
	}
});

const mapActionsToProps = {
	saveUser: (props, store) => user => store.setState(saveUser(user)),
	saveParams: (props, store) => params => store.setState(saveUser({ ...props.user, params })),
	signOut: (props, store) => () => store.setState(signOut()),
};

const AccountContainer = Connect(mapSubscriptionsToProps, mapActionsToProps)(Account);

AccountContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default AccountContainer;
