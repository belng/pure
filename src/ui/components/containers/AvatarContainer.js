/* @flow */

import React, { PropTypes } from 'react';
import buildAvatarURLForSize from '../../../modules/avatar/buildAvatarURLForSize';
import Avatar from '../views/Avatar';
import { cache, config } from '../../../core-client';

const { host, protocol } = config.server;

const getUserAvatar = (user, size = 48) => {
	const userObj = cache.getEntity(user);

	if (userObj.meta && userObj.meta.picture) {
		return buildAvatarURLForSize(userObj.meta.picture, size);
	} else {
		return `${protocol}//${host}/i/picture?user=${user}&size=${size}`;
	}
};

const AvatarContainer = (props: any) => <Avatar { ...props } uri={getUserAvatar(props.user, props.size)} />;

AvatarContainer.defaultProps = {
	size: 48
};

AvatarContainer.propTypes = {
	user: PropTypes.string,
	size: PropTypes.number
};

export default AvatarContainer;
