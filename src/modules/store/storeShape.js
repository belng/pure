/* @flow */

import { PropTypes } from 'react';

export default PropTypes.shape({
	watch: PropTypes.func.isRequired,
	dispatch: PropTypes.func.isRequired,
});
