/* @flow */

import { PropTypes } from 'react';

export default PropTypes.shape({
	subscribe: PropTypes.func.isRequired,
});

export type Store = {
	subscribe(
		slice: { type: Function },
		range?: { start?: number, before?: number, after?: number },
		callback: Function
	): { remove: Function };
}
