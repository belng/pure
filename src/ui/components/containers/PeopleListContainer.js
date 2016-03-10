/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PeopleList from '../views/PeopleList';

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
		component={PeopleList}
	/>
);

PeopleListContainer.propTypes = {
	thread: PropTypes.string.isRequired
};

export default PeopleListContainer;
