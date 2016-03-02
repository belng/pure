/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import getAvatarURL from '../../../lib/getAvatarURL';
import Dummy from '../views/Dummy';
import { config } from '../../../core-client';

const { host, protocol } = config.server;

const extractAvatarURL = (user, size = 48) => {
	if (user.picture) {
		return getAvatarURL(user.picture, size);
	} else {
		return protocol + '//' + host + '/' + user.id + '/picture?size=' + size;
	}
};

const AvatarContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			user: {
				key: {
					type: 'entity',
					id: props.user,
				},
				transform: user => extractAvatarURL(user && user.id ? user : { id: props.user }, props.size)
			}
		}}
		passProps={props}
		component={Dummy}
	/>
);

AvatarContainer.defaultProps = {
	size: 48
};

AvatarContainer.propTypes = {
	user: PropTypes.string.isRequired,
	size: PropTypes.number
};

export default AvatarContainer;
