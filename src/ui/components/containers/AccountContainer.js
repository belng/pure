/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { saveUser, saveParams, signOut } from '../../../modules/store/actions';

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
	saveParams: (props, store) => params => store.setState(saveParams(props.user, params)),
	signOut: (props, store) => () => store.setState(signOut()),
};

const AccountContainer = Connect(mapSubscriptionsToProps, mapActionsToProps)(Dummy);

AccountContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default AccountContainer;
