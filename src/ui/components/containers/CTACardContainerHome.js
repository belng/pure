/* @flow */

import flowRight from 'lodash/flowRight';
import createUserContainer from '../../../modules/store/createUserContainer';
import createContainer from '../../../modules/store/createContainer';
import CTACard from '../views/Card/CTACard';

const mapSubscriptionToProps = ({ user }) => ({
	user: {
		type: 'entity',
		options: {
			id: user,
		},
	},
	data: {
		type: 'ctahome',
	},
});

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps),
)(CTACard);
