/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PeopleList from '../views/PeopleList';

const filterInvalidRels = data => data.filter(result => result.user && result.rel);

const PeopleListContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			data: {
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
				},
				transform: filterInvalidRels
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
