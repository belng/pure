/* @flow */

import { subscribe } from '../store/store';
import GCMPreferences from '../../ui/modules/GCMPreferences';

subscribe({ type: 'state', path: 'session', source: 'gcm' }, session => {
	if (session === '@@loading') {
		return;
	}

	GCMPreferences.saveSession(session || '');
});
