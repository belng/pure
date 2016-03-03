/* @flow */

// $FlowFixMe
global.babelHelpers.typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? obj => typeof obj : obj => {
	return obj && typeof Symbol === 'function' && obj.constructor === Symbol ? 'symbol' : typeof obj;
};
