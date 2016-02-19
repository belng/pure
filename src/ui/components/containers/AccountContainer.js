/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { saveUser, saveParams, signOut } from '../../../modules/store/actions';

const mapSubscriptionsToProps = {
	user: 'me'
};

const mapActionsToProps = {
	saveUser: (props, store) => user => store.put(saveUser(user)),
	saveParams: (props, store) => params => store.put(saveParams(props.user, params)),
	signOut: (props, store) => () => store.put(signOut()),
};

const AccountContainer = Connect(mapSubscriptionsToProps, mapActionsToProps)(Dummy);

AccountContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default AccountContainer;
