/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import getAvatarURL from '../../../lib/getAvatarURL';
import Avatar from '../views/Avatar';
import { config } from '../../../core-client';

const { host, protocol } = config.server;

const extractAvatarURL = (user, size = 48) => {
	if (user.meta && user.meta.picture) {
		return getAvatarURL(user.meta.picture, size);
	} else {
		return protocol + '//' + host + '/' + user.id + '/picture?size=' + size;
	}
};

const AvatarContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			uri: {
				key: {
					type: 'entity',
					id: props.user,
				},
				transform: user => extractAvatarURL(user && user.id ? user : { id: props.user }, props.size)
			}
		}}
		passProps={props}
		component={Avatar}
	/>
);

AvatarContainer.defaultProps = {
	size: 48
};

AvatarContainer.propTypes = {
	user: PropTypes.string,
	size: PropTypes.number
};

export default AvatarContainer;
