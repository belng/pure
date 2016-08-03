/* @flow */

import shareLinkSaga from './shareLinkSaga';
import shareFacebookSaga from './shareFacebookSaga';
import shareTwitterSaga from './shareTwitterSaga';
import shareWhatsAppSaga from './shareWhatsAppSaga';

export default function *shareSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield [
		shareLinkSaga(),
		shareFacebookSaga(),
		shareTwitterSaga(),
		shareWhatsAppSaga(),
	];
}
