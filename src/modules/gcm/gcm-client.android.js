import { bus } from '../../core-client';
import GCM from '../../ui/modules/GCM';

bus.on('postchange', changes => {
	if (changes.state && 'session' in changes.state) {
		const { session } = changes.state;

		if (session === '@@loading') {
			return;
		}

		if (session && typeof changes.state.session === 'string') {
			GCM.saveSession(changes.state.session);
		} else {
			GCM.saveSession('');
		}
	}
});
