import { bus } from '../../core-client';
import GCM from '../../ui/modules/GCM';

bus.on('postchange', changes => {
	if (changes.state && 'session' in changes.state) {
		const { session } = changes.state;

		if (session) {
			if (session === '@@loading') {
				return;
			}

			GCM.saveSession(changes.state.session);
		} else {
			GCM.saveSession('');
		}
	}
});
