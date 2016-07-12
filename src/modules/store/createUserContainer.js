/* @flow */

import createContainer from './createContainer';

const mapSubscriptionToProps = {
	user: {
		type: 'user',
	},
};

export default function() {
	return createContainer(mapSubscriptionToProps);
}
