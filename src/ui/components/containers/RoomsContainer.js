/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Rooms from '../views/Rooms';

class RoomsContainer extends Component {
	render() {
		const { user } = this.props;

		return (
			<Connect
				mapSubscriptionToProps={{
					data: {
						key: {
							slice: {
								type: 'rel',
								link: {
									room: 'item',
								},
								filter: {
									user
								},
								order: 'roleTime'
							},
							range: {
								start: -Infinity,
								end: Infinity,
							}
						}
					}
				}}
				passProps={this.props}
				component={Rooms}
			/>
		);
	}
}

RoomsContainer.propTypes = {
	user: PropTypes.string.isRequired
};

const mapSubscriptionToProps = {
	user: {
		key: {
			type: 'state',
			path: 'user'
		},
	},
};

const RoomsContainerOuter = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		passProps={props}
		component={RoomsContainer}
	/>
);

export default RoomsContainerOuter;
