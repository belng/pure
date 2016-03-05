/* @flow */

import React, { PropTypes } from 'react';
import Banner from './Banner';

type Props = {
	status: 'connecting' | 'online' | 'offline'
}

const BannerOffline = ({ status }: Props) => {
	let label;

	switch (status) {
	case 'online':
		label = '';
		break;
	case 'offline':
		label = 'Network unavailable. Waiting for connection…';
		break;
	default:
		label = 'Connecting to server…';
	}

	return (
		<Banner
			text={label}
			showClose={false}
		/>
	);
};

BannerOffline.propTypes = {
	status: PropTypes.oneOf([ 'connecting', 'offline', 'online' ])
};

export default BannerOffline;
