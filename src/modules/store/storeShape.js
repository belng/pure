/* @flow */

import { PropTypes } from 'react';

export default PropTypes.shape({
	get: PropTypes.func.isRequired,
	getCurrent: PropTypes.func.isRequired,
	observe: PropTypes.func.isRequired,
	dispatch: PropTypes.func.isRequired,
});
