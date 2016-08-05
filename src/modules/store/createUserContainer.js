/* @flow */

import createContainer from './createContainer';

const mapSubscriptionToProps = {
	user: {
		type: 'state',
		path: 'user',
	},
};

export default function() {
	return createContainer(mapSubscriptionToProps);
}
