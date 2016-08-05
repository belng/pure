/* @flow */

import React, { PropTypes, Component } from 'react';
import createContainer from '../../../modules/store/createContainer';
import UserSwitcher from '../views/UserSwitcher';
import { initializeSession } from '../../../modules/store/actions';

type Props = {
	user: string;
	data: ?Array<{ user: string; session: string }>;
	switchUser: Function;
}

class UserSwitcherContainerInner extends Component<void, Props, void> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.shape({
			user: PropTypes.string,
			session: PropTypes.string,
		})),
		user: PropTypes.string.isRequired,
		switchUser: PropTypes.func.isRequired,
	};

	render() {
		const {
			data,
			user,
		} = this.props;

		if (data) {
			return (
				<UserSwitcher
					{...this.state}
					{...this.props}
					user={user}
				/>
			);
		}

		return null;
	}
}

const mapSubscriptionToProps = {
	user: {
		type: 'state',
		path: 'user',
	},
	data: {
		type: 'state',
		path: 'sessionList',
	},
};

const mapDispatchToProps = dispatch => ({
	switchUser: (user, item) => {
		dispatch({ type: 'SIGNOUT' });

		if (item && user === item.user) {
			return;
		}

		if (item && item.session) {
			dispatch(initializeSession(item.session));
		}
	},
});

export default createContainer(
	mapSubscriptionToProps,
	mapDispatchToProps,
)(UserSwitcherContainerInner);
