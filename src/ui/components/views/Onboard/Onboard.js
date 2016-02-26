/* @flow */

import React, { PropTypes } from 'react';
import SignIn from './SignIn';
import UserDetails from './UserDetails';
import LocationDetails from './LocationDetails';
import GetStarted from './GetStarted';
import HomeContainer from '../../containers/HomeContainer';

const Onboard = (props: Object) => {
	switch (props.page) {
	case 'PAGE_SIGN_IN':
		return <SignIn {...props} />;
	case 'PAGE_USER_DETAILS':
		return <UserDetails {...props} />;
	case 'PAGE_PLACES':
		return <LocationDetails {...props} />;
	case 'PAGE_GET_STARTED':
		return <GetStarted {...props} />;
	case 'PAGE_HOME':
		return <HomeContainer {...props} />;
	default:
		return null;
	}
};

Onboard.propTypes = {
	page: PropTypes.string
};

export default Onboard;
