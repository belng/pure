/* @flow */

import { PropTypes } from 'react';
import { config } from '../../../core-client';
import Connect from '../../../modules/store/Connect';
import getAvatarURL from '../../../lib/getAvatarURL';
import Dummy from '../views/Dummy';

const { host, protocol } = config.server;

const extractAvatarURL = (user, size = 48) => {
	if (user.picture) {
		return getAvatarURL(user.picture, size);
	} else {
		return protocol + '//' + host + '/' + user.id + '/picture?size=' + size;
	}
};

const AvatarContainer = Connect(({ user, size }) => ({
	user: {
		key: {
			slice: {
				type: 'entity',
				filter: {
					id: user
				}
			}
		},
		transform: userObj => extractAvatarURL(userObj && userObj.id ? user : { id: user }, size)
	}
}))(Dummy);

AvatarContainer.defaultProps = {
	size: 48
};

AvatarContainer.propTypes = {
	nick: PropTypes.string.isRequired,
	size: PropTypes.number
};

export default AvatarContainer;
