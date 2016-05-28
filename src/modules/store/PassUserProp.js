/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import Connect from './Connect';

const mapSubscriptionToProps = {
	user: {
		key: {
			type: 'state',
			path: 'user',
		},
	},
};

export default function(component: ReactClass<any>): ReactClass<any> {
	class PassUserProp extends Component<void, any, void> {
		static propTypes = {
			user: PropTypes.string,
		};

		shouldComponentUpdate(nextProps: any, nextState: any): boolean {
			return shallowCompare(this, nextProps, nextState);
		}

		render() {
			return (
				<Connect
					mapSubscriptionToProps={mapSubscriptionToProps}
					passProps={this.props}
					component={component}
				/>
			);
		}
	}

	return PassUserProp;
}
