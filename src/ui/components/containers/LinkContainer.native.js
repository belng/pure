/* @flow */

import createContainer from '../../../modules/store/createContainer';
import Link from '../views/Core/Link';

const mapDispatchToProps = dispatch => ({
	openLink: url => dispatch({
		type: 'OPEN_LINK',
		payload: url,
	}),
});

export default createContainer(null, mapDispatchToProps)(Link);
