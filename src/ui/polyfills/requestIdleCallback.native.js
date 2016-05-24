/* @flow */

import ReactNative from 'react-native';

const {
	InteractionManager,
} = ReactNative;

const pendingcallbacks = {};
let id = 0;

global.requestIdleCallback = (callback: Function) => {
	const handle = id++;
	pendingcallbacks[handle] = true;
	InteractionManager.runAfterInteractions(() => {
		if (pendingcallbacks[handle]) {
			global.requestAnimationFrame(callback);
		}
		delete pendingcallbacks[handle];
	});
	return handle;
};

global.cancelIdleCallback = (handle: number) => {
	if (pendingcallbacks[handle]) {
		delete pendingcallbacks[handle];
	}
};
