import { bus } from '../../core-client';
import GCMPreferences from '../../ui/modules/GCMPreferences';

bus.on('postchange', changes => {
	if (changes.state && 'session' in changes.state) {
		const { session } = changes.state;

		if (session === '@@loading') {
			return;
		}

		if (session && typeof changes.state.session === 'string') {
			GCMPreferences.saveSession(changes.state.session);
		} else {
			GCMPreferences.saveSession('');
		}
	}
});
