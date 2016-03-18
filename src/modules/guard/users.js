import { bus, Constants } from '../../core-base';
import EnhancedError from '../../lib/EnhancedError';
import winston from 'winston';
bus.on('change', (changes, next) => {
	winston.info('user validation:');
	if (!changes.entities) return next();

	for (const id in changes.entities) {
		const entity = changes.entities[id];
		if (entity.type === Constants.TYPE_USER) {
			// list of validation for user creation
			if (!entity.identities || !entity.identities.length) {
				return next(new EnhancedError(
					'INVALID_USER_IDENTITIES',
					'INVALID_USER_IDENTITIES'
				));
			}
		}
	}

	return next();
}, Constants.APP_PRIORITIES.USER_VALIDATION);
