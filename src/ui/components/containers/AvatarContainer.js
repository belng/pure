/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import getAvatarURL from '../../../lib/getAvatarURL';

const extractAvatarURL = (user, size = 48) => {
	if (user.picture) {
		return getAvatarURL(user.picture, size);
	} else {
		// TODO: add protocol and host
		return user.id + '/picture?size=' + size;
	}
};

const AvatarContainer = Connect(({ nick, size }) => ({
	user: {
		slice: {
			type: 'user',
			filter: {
				id: nick
			}
		},
		transform: user => extractAvatarURL(user && user.id ? user : { id: nick }, size)
	}
}))(/* Component */);

AvatarContainer.defaultProps = {
	size: 48
};

AvatarContainer.propTypes = {
	nick: PropTypes.string.isRequired,
	size: PropTypes.number
};

export default AvatarContainer;
