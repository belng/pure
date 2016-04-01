/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import Rooms from '../views/Rooms';

const filterInvalidRels = data => data.filter(result => result.room && result.roomrel);

class RoomsContainer extends Component {
	static propTypes = {
		user: PropTypes.string.isRequired
	};

	render() {
		const { user } = this.props;

		return (
			<Connect
				mapSubscriptionToProps={{
					data: {
						key: {
							slice: {
								type: 'roomrel',
								link: {
									room: 'item',
								},
								filter: {
									user
								},
								order: 'createTime'
							},
							range: {
								start: -Infinity,
								end: Infinity,
							}
						},
						transform: filterInvalidRels
					}
				}}
				passProps={this.props}
				component={Rooms}
			/>
		);
	}
}

export default PassUserProp(RoomsContainer);
