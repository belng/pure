/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const PeopleListContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			count: {
				key: {
					slice: {
						type: 'rel',
						link: {
							user: 'user'
						},
						filter: {
							item: props.thread
						},
						order: 'presenceTime'
					},
					range: {
						start: Infinity,
						before: 100,
						after: 0
					}
				}
			}
		}}
		passProps={props}
		component={Dummy}
	/>
);

PeopleListContainer.propTypes = {
	thread: PropTypes.string.isRequired
};

export default PeopleListContainer;
