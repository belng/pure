/* @flow */

import flowRight from 'lodash/flowRight';
import createUserContainer from '../../../modules/store/createUserContainer';
import createContainer from '../../../modules/store/createContainer';
import CTACard from '../views/Card/CTACard';

const mapSubscriptionToProps = ({ user, room }) => ({
	user: {
		type: 'entity',
		options: {
			id: user,
		},
	},
	room: {
		type: 'entity',
		options: {
			id: room,
		},
	},
	data: {
		type: 'ctaroom',
	},
});

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps),
)(CTACard);
