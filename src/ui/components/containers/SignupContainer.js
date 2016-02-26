/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import SignUp from '../views/Onboard/SignUp';

// TODO: Signup container
const SignUpContainer = Connect(null, null)(SignUp);

SignUpContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default SignUpContainer;
