/* @flow */

import React, { PropTypes, Component } from 'react';
import Connect from '../../../modules/store/Connect';
import UserSwitcher from '../views/UserSwitcher';
import { TAG_USER_ADMIN } from '../../../lib/Constants';
import { config } from '../../../core-client';
import { initializeSession } from '../../../modules/store/actions';
import type { User } from '../../../lib/schemaTypes';

const {
	server: {
		host,
		protocol,
	}
} = config;

type Props = {
	me: User;
	switchUser: Function;
}

type State = {
	data: Array<{ user: string, session: string }>;
}

class UserSwitcherContainerInner extends Component<void, Props, State> {
	static propTypes = {
		me: PropTypes.shape({
			id: PropTypes.string,
			tags: PropTypes.arrayOf(PropTypes.number)
		}).isRequired,
		switchUser: PropTypes.func.isRequired,
	};

	state: State = {
		data: [],
	};

	_fetchData: Function = async () => {
		const { me } = this.props;

		if (me.params && me.params.sessions_list) {
			const list = await fetch(`${protocol}//${host}/${me.params.sessions_list}`);
			const data = await list.json();

			this.setState({
				data
			});
		}
	};

	render() {
		const { me } = this.props;

		if (me && me.tags && me.tags.indexOf(TAG_USER_ADMIN) > -1) {
			return (
				<UserSwitcher
					{...this.state}
					{...this.props}
					user={me.id}
				/>
			);
		}

		return null;
	}
}

const mapSubscriptionToProps = {
	me: {
		key: 'me'
	}
};

const mapActionsToProps = {
	switchUser: (store, result) => item => {
		const { me } = result;

		if (me && me.id === item.user) {
			return;
		}

		store.dispatch(initializeSession(item.session));
	},
};

const UserSwitcherContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={UserSwitcherContainerInner}
	/>
);

export default UserSwitcherContainer;
