/* @flow */


import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import Account from '../views/Account/Account';
import { saveUser, signOut } from '../../../modules/store/actions';

const mapDispatchToProps = dispatch => ({
	saveUser: user => dispatch(saveUser(user)),
	signOut: () => dispatch(signOut()),
});

const mapSubscriptionToProps = ({ user }) => ({
	data: {
		type: 'entity',
		options: {
			id: user,
		},
	},
});

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps, mapDispatchToProps),
)(Account);
