/* @flow */

export function open(url: string) {
	return new Observable(observer => {
		const popup = window.open(url);
		if (!popup) {
			observer.error(new Error(`Failed to open window for ${url}`));
			return;
		}
		const timer = setInterval(() => {
			if (popup.closed) {
				observer.complete();
			}
		}, 300);
		const listener = event => {
			if (event.source === popup) {
				observer.next(event);
			}
		};
		window.addEventListener('message', listener);
		return () => { // eslint-disable-line consistent-return
			if (timer) {
				clearInterval(timer);
			}
			window.removeEventListener('message', listener);
		};
	});
}
