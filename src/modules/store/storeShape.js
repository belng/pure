/* @flow */

import { PropTypes } from 'react';

export default PropTypes.shape({
	watch: PropTypes.func.isRequired,
	dispatch: PropTypes.func.isRequired,
});

export type Action = {
	type: string,
	payload?: any
}

export type Store = {
	watch(event: string, options?: Object, callback: Function): { clear: Function };
	dispatch(action: Action): void;
}
